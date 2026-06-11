/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

const LOGS_DIR = path.join(process.cwd(), 'data', 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export const securityWinstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(LOGS_DIR, 'security.log') }),
    new winston.transports.Console()
  ]
});

export interface SecurityEvent {
  type: string;
  userId: string;
  method?: string[];
  ip: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export function logSecurityEvent(event: SecurityEvent): void {
  try {
    securityWinstonLogger.info({
      message: `Security Event: ${event.type}`,
      userId: event.userId,
      method: event.method,
      ip: event.ip,
      timestamp: event.timestamp ? event.timestamp.toISOString() : new Date().toISOString(),
      details: event.details
    });
  } catch (err) {
    console.error("Failed writing to security log transporter:", err);
  }
}
