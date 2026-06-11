/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import nodemailer from 'nodemailer';

let transporterInstance: any = null;

export function getTransporter(): any {
  if (!transporterInstance) {
    const host = process.env.SMTP_HOST || '';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    if (!host || !user || !pass) {
      console.warn("SMTP is not fully configured (SMTP_HOST, SMTP_USER, SMTP_PASS are missing). Standard fallback simulation mode.");
      return null;
    }

    try {
      transporterInstance = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } catch (err) {
      console.error("Failed to initialize Nodemailer SMTP transporter:", err);
      transporterInstance = null;
    }
  }
  return transporterInstance;
}

export async function sendEmailOTP(email: string, otp: string): Promise<void> {
  const transporter = getTransporter();
  const fromEmail = process.env.EMAIL_FROM || 'no-reply@sou9aljoumla.com';

  console.log(`[EMAIL SERVICE LOG] Intending to send OTP ${otp} to email: ${email}`);

  if (!transporter) {
    console.log(`[SIMULATED EMAIL SERVICE] To: ${email} | OTP Code: ${otp}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: "Verification Code | رمز التحقق - سوق الجملة",
      text: `Your verification code is: ${otp}\nرمز التحقق الخاص بك هو: ${otp}`,
      html: `
        <div style="font-family: 'Cairo', 'Inter', sans-serif; text-align: center; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px; margin: 0 auto; direction: rtl;">
          <h2 style="color: #ff6600; margin-bottom: 5px;">سوق الجملة | Sou9AlJoumla</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">منصة الجملة المغربية الأولى</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="font-size: 16px; color: #1d2731;">يرجى استخدام رمز التحقق التالي لإكمال العملية:</p>
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #ff6600; margin: 20px 0; border-radius: 6px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
            هذا الرمز صالح لمدة 10 دقائق فقط لدواعي أمنية.<br/>
            إذا لم تكن أنت من طلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.
          </p>
        </div>
      `
    });
    console.log(`[EMAIL SERVICE] Real OTP email sent successfully to ${email}`);
  } catch (err: any) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send real SMTP email to ${email}:`, err);
    console.log(`[EMAIL SERVICE FALLBACK] Simulated OTP console dump for ${email}: ${otp}`);
  }
}
