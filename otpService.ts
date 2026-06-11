/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { dbInstance } from '../db';
import { sendEmailOTP } from './emailService';
import { sendSMSOTP } from './smsService';
import { logSecurityEvent } from './securityLogger';
import { OtpVerification } from '../../src/types';

// Helper to generate a robust secure SHA-256 hash preventing replay tamper attacks
export function calculateOtpHash(userId: string, otp: string, expiresAt: number, context: string): string {
  return crypto
    .createHash('sha256')
    .update(`${userId}:${otp.trim()}:${expiresAt}:${context}`)
    .digest('hex');
}

export async function saveOTPToDatabase(data: { 
  userId: string; 
  otp: string; 
  expiresAt: number;
  context: string;
  ip: string;
  deviceId?: string;
}): Promise<OtpVerification> {
  const list = dbInstance.getOtpVerifications();
  
  // Decimate any general active OTPs for the same user with the matching transaction context
  const filtered = list.filter(item => !(item.userId === data.userId && item.context === data.context && !item.used));
  list.length = 0;
  list.push(...filtered);

  const hash = calculateOtpHash(data.userId, data.otp, data.expiresAt, data.context);

  const verification: OtpVerification & { lastAttemptAt?: number } = {
    id: 'otp-' + Math.random().toString(36).substring(2, 11),
    userId: data.userId,
    otp: data.otp,
    otpHash: hash,
    context: data.context,
    deviceId: data.deviceId,
    attempts: 0,
    ip: data.ip,
    expiresAt: data.expiresAt,
    createdAt: Date.now(),
    used: false
  };

  list.push(verification);
  dbInstance.persist();
  return verification;
}

export async function markOTPAsUsedByRecord(id: string): Promise<void> {
  const list = dbInstance.getOtpVerifications();
  const record = list.find(item => item.id === id);
  if (record) {
    record.used = true;
    dbInstance.persist();
  }
}

export async function sendOTP(
  user: any, 
  otp: string, 
  context: string, 
  ip: string = "unknown", 
  deviceId?: string
): Promise<void> {
  const userId = user.id;
  const email = user.email || '';
  const phone = user.phone || '';

  // 1. Intelligent User-based and Email-based Rate Limiting (Max 5 requests in 10 minutes)
  const list = dbInstance.getOtpVerifications();
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  
  const recentCountForUser = list.filter(item => 
    item.userId === userId && 
    item.createdAt > tenMinutesAgo
  ).length;

  if (recentCountForUser >= 5) {
    logSecurityEvent({
      type: "OTP_RATE_LIMITED",
      userId,
      ip,
      timestamp: new Date(),
      details: { email, phone, context, recentCountForUser }
    });
    throw new Error("لقد تجاوزت الحد الأقصى المسموح به لطلبات رموز التحقق (5 محاولات كل 10 دقائق). يرجى المحاولة بشكل أبطأ.");
  }

  // 2. Generate and store record
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

  await saveOTPToDatabase({
    userId,
    otp,
    expiresAt,
    context,
    ip,
    deviceId
  });

  // 3. Email execution (Always guaranteed)
  try {
    await sendEmailOTP(email, otp);
  } catch (emailErr) {
    console.error(`Failed sending basic email OTP to ${email}:`, emailErr);
  }

  // 4. SMS dispatch (Optional, zero crash propagation)
  if (phone) {
    try {
      await sendSMSOTP(phone, otp);
    } catch (smsErr) {
      console.error(`Non-blocking Twilio dispatch failure for phone ${phone}:`, smsErr);
    }
  }

  // 5. Audit Security Level 2 Logging
  logSecurityEvent({
    type: "OTP_SENT",
    userId,
    method: phone ? ["email", "sms"] : ["email"],
    ip,
    timestamp: new Date(),
    details: { context, expiresAt, deviceId }
  });
}

export async function verifyOTP(
  userId: string, 
  otp: string, 
  requiredContext: string, 
  ip: string = "unknown",
  deviceId?: string,
  consume: boolean = true
): Promise<boolean> {
  const list = dbInstance.getOtpVerifications() as any[];
  
  // Find record belonging to the user for the matching security transaction purpose
  const record = list.find(item => 
    item.userId === userId && 
    item.context === requiredContext && 
    !item.used
  );

  if (!record) {
    logSecurityEvent({
      type: "OTP_FAILED_ATTEMPT",
      userId,
      ip,
      timestamp: new Date(),
      details: { otpAttempt: otp, error: "No active unused OTP found for this context", requiredContext, deviceId }
    });
    throw new Error("رمز التحقق غير صحيح، أو انتهت صلاحيته، أو تم استخدامه مسبقاً.");
  }

  // Checking for Replay Attack indicators
  const computedCurrentHash = calculateOtpHash(userId, otp, record.expiresAt, record.context);
  const anyReplayedRecord = list.find(item => item.otpHash === computedCurrentHash && item.used);
  if (anyReplayedRecord) {
    logSecurityEvent({
      type: "OTP_REPLAY_ATTEMPT",
      userId,
      ip,
      timestamp: new Date(),
      details: { requiredContext, replayedOtpId: anyReplayedRecord.id, deviceId, suspiciousHash: computedCurrentHash }
    });
    throw new Error("محاولة غير مصرح بها: تم الكشف عن محاولة إعادة استخدام رمز أمان مفعّل سابقاً (Replay Attack Protection).");
  }

  // Prevent Context-Cross Impersonation (Double-checking context matches)
  if (record.context !== requiredContext) {
    logSecurityEvent({
      type: "OTP_CONTEXT_MISMATCH",
      userId,
      ip,
      timestamp: new Date(),
      details: { requestedContext: requiredContext, savedContext: record.context, recordId: record.id, deviceId }
    });
    throw new Error("محاولة فك حظر تالفة: لا يتطابق الرمز الثنائي المختار مع هذه العملية الأمنية.");
  }

  // Window Timing Protection (minimum 2 seconds between validation loops to disrupt automation)
  const now = Date.now();
  if (record.lastAttemptAt && now - record.lastAttemptAt < 2000) {
    logSecurityEvent({
      type: "OTP_WINDOW_VIOLATION",
      userId,
      ip,
      timestamp: new Date(),
      details: { lastAttemptDelta: now - record.lastAttemptAt, recordId: record.id, deviceId }
    });
    throw new Error("يرجى الانتظار لمدة ثانيتين على الأقل بين إدخال وإدخال محاولات التحقق لمنع هجمات التخمين.");
  }

  record.lastAttemptAt = now;
  dbInstance.persist();

  // Expired checks
  if (now > record.expiresAt) {
    logSecurityEvent({
      type: "OTP_FAILED_ATTEMPT",
      userId,
      ip,
      timestamp: new Date(),
      details: { error: "OTP has already expired", expiresAt: record.expiresAt, recordId: record.id, deviceId }
    });
    throw new Error("انتهت صلاحية رمز التحقق الأمني. يرجى طلب كود جديد.");
  }

  // Check matching values
  if (record.otp.trim() !== otp.trim()) {
    record.attempts += 1;
    dbInstance.persist();

    // Shield 1: Max 3 invalid attempts lock inside continuous verification window
    if (record.attempts >= 3 && record.attempts < 5) {
      logSecurityEvent({
        type: "OTP_BRUTE_FORCE_LOCKOUT",
        userId,
        ip,
        timestamp: new Date(),
        details: { attempts: record.attempts, recordId: record.id, deviceId }
      });
      throw new Error(`لقد قمت بإدخال الرمز بشكل خاطئ (${record.attempts} مرات). يرجى توخي الحذر، سيتم إلغاء الرمز بالكامل عند الخطأ الخامس.`);
    }

    // Shield 2: Max 5 invalid attempts → Regenerate OTP fully forced (invalidate the record)
    if (record.attempts >= 5) {
      record.used = true; // Block forever from future attempts
      dbInstance.persist();

      logSecurityEvent({
        type: "OTP_BRUTE_FORCE_REGENERATION_FORCED",
        userId,
        ip,
        timestamp: new Date(),
        details: { attempts: record.attempts, recordId: record.id, deviceId }
      });
      throw new Error("تم تعطيل رمز الأمان هذا لتجاوزك الحد الأقصى للمحاولات الخاطئة (5 محاولات). يرجى توليد رمز جديد والمحاولة من جديد.");
    }

    logSecurityEvent({
      type: "OTP_FAILED_ATTEMPT",
      userId,
      ip,
      timestamp: new Date(),
      details: { attempts: record.attempts, recordId: record.id, deviceId }
    });
    throw new Error("الرمز الأمني الذي أدخلته غير صحيح. يرجى التثبت والمحاولة مجدداً.");
  }

  // Success flow validation
  if (consume) {
    await markOTPAsUsedByRecord(record.id);
  }

  logSecurityEvent({
    type: "OTP_SUCCESS",
    userId,
    ip,
    timestamp: new Date(),
    details: { context: requiredContext, deviceId }
  });

  return true;
}
