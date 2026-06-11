/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import twilio from 'twilio';

let twilioClientInstance: any = null;

export function getTwilioClient(): any {
  if (!twilioClientInstance) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';

    if (!accountSid || !authToken) {
      console.warn("SMS disabled - Twilio is not configured (TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is missing).");
      return null;
    }

    try {
      twilioClientInstance = twilio(accountSid, authToken);
    } catch (err) {
      console.error("SMS initialization failed - unable to build twilio client instance:", err);
      twilioClientInstance = null;
    }
  }
  return twilioClientInstance;
}

export async function sendSMSOTP(phone: string, otp: string): Promise<void> {
  const twilioClient = getTwilioClient();
  const fromNumber = process.env.TWILIO_FROM_NUMBER || '';

  console.log(`[SMS SERVICE LOG] Intending to send OTP ${otp} via SMS to phone: ${phone}`);

  if (!twilioClient) {
    console.warn("SMS disabled - Twilio not configured");
    return;
  }

  if (!fromNumber) {
    console.warn("SMS sending failed: TWILIO_FROM_NUMBER environment variable is not defined");
    return;
  }

  try {
    const message = await twilioClient.messages.create({
      body: `Your verification code is: ${otp} / رمز التحقق الخاص بك لـ سوق الجملة هو: ${otp}`,
      from: fromNumber,
      to: phone,
    });
    console.log(`[SMS SERVICE] Real Twilio SMS sent successfully. Message SID: ${message.sid}`);
  } catch (err: any) {
    console.error(`[SMS SERVICE ERROR] Failed to send real Twilio SMS to ${phone}:`, err);
    console.log(`[SMS SERVICE FALLBACK] Simulated SMS dump for ${phone}: ${otp}`);
  }
}
