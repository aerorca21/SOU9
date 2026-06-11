/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import winston from 'winston';
import { createServer as createViteServer } from 'vite';
import { dbInstance } from './server/db';
import { User, Product, WalletTransaction, Comment, Message, ChatRoom, Review, Coupon, RechargeCode, Report, AuditLog, Order } from './src/types';

// OTP Secure System Imports
import { generateOTP } from './server/utils/otp';
import { sendOTP, verifyOTP } from './server/services/otpService';
import { logSecurityEvent } from './server/services/securityLogger';
import { sendEmailOTP } from './server/services/emailService';
import { sendSMSOTP } from './server/services/smsService';

// Encryption configuration for Cloudflare Deployment Settings
const passPhrase = process.env.CLOUDFLARE_ENCRYPTION_KEY || 'sou9aljoumla-cloudflare-secret-key-phrase-2026';
const SECRET_KEY = crypto.createHash('sha256').update(passPhrase).digest();
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  if (!text) return '';
  try {
    const parts = text.split(':');
    if (parts.length < 2) return text; // If not encrypted format, return as-is
    const iv = Buffer.from(parts.shift() || '', 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedText).toString('utf8');
    decrypted += decipher.final().toString('utf8');
    return decrypted;
  } catch (err) {
    return text; // Fallback to raw if decryption fails
  }
}

function validateStrongPassword(password: string): string | null {
  if (!password || password.length < 12) {
    return 'يجب أن تتكون كلمة المرور من 12 حرفاً على الأقل لضمان أمان حسابك.';
  }
  const low = password.toLowerCase();
  const commonWeak = ['password', '12345678', '123456789', 'admin123', 'qwerty', 'maroc123', 'morocco123', 'sou9aljoumla', '1234567890'];
  if (commonWeak.some(w => low.includes(w))) {
    return 'كلمة المرور ضعيفة جداً وتتضمن كلمات شائعة ومخترقة بسهولة. يرجى اختيار كلمة مرور أكثر تعقيداً.';
  }
  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  if (!hasLetter || !hasDigit) {
    return 'يجب أن تحتوي كلمة المرور على أحرف وأرقام معاً لزيادة مستوى قوة الأمان.';
  }
  return null;
}

// Robust, lightweight XSS & HTML scrubbing sanitizer (XSS Protection - Phase 7)
function sanitizeHTML(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let sanitized = text;
  
  // Strip active scripting tags
  sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '');
  sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Strip Inline Event Handlers
  sanitized = sanitized.replace(/\bon[a-z]+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\bon[a-z]+\s*=\s*[^ >]+/gi, '');
  
  // Strip javascript schemas
  sanitized = sanitized.replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"');
  
  // Escape potential elements to render them safely as plaintext in views
  sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  return sanitized;
}

// Secure password hashing helper (PBKDF2 with randomly generated salt)
function hashPassword(pass: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pass, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2:${salt}:${hash}`;
}

// Compare user password (compatible with old plaintext, SHA-256, and newly PBKDF2 hashed passwords)
function comparePassword(userId: string, inputPass: string, storedPass: string): boolean {
  if (!storedPass) return false;
  if (storedPass.startsWith('pbkdf2:')) {
    const parts = storedPass.split(':');
    if (parts.length === 3) {
      const salt = parts[1];
      const hash = parts[2];
      const inputHash = crypto.pbkdf2Sync(inputPass, salt, 100000, 64, 'sha512').toString('hex');
      return hash === inputHash;
    }
  }
  // If stored password is already a SHA-256 hash (64 hex characters)
  if (storedPass.length === 64 && /^[0-9a-f]+$/i.test(storedPass)) {
    const sha256 = crypto.createHash('sha256').update(inputPass).digest('hex');
    return storedPass === sha256;
  }
  // Otherwise, it's a legacy plain-text password
  return storedPass === inputPass;
}

const app = express();
const PORT = 3000;

// Define custom express.Request properties for TS type safety
declare global {
  namespace Express {
    interface Request {
      sessionUser?: {
        userId: string;
        role: string;
        expiresAt: number;
      };
    }
  }
}

// -----------------------------------------------------------------------------
// SECURE LOGGING CONFIG (Phase 12)
// -----------------------------------------------------------------------------
const LOGS_DIR = path.join(process.cwd(), 'data', 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export const securityLogger = winston.createLogger({
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

export const paymentsLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(LOGS_DIR, 'payments.log') }),
    new winston.transports.Console()
  ]
});

export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(LOGS_DIR, 'audit.log') }),
    new winston.transports.Console()
  ]
});

// -----------------------------------------------------------------------------
// GLOBAL SECURITY MIDDLEWARES
// -----------------------------------------------------------------------------

// Active Session Storage map for JWT-less state persistence (Phase 11)
export const sessionStore = new Map<string, { userId: string; role: string; passwordVersion?: number; deviceFingerprint?: string; ipAddress?: string; expiresAt: number }>();

export function setSessionCookie(res: express.Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('s9_session', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000 // 2 hours
  });
}

// 1. Helmet integration with custom, strict Content Security Policy allowing required domains (Security Headers)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.google.com", "https://*.googleusercontent.com"],
      mediaSrc: ["'self'", "data:", "/uploads/"],
      connectSrc: ["'self'", "https://api-m.sandbox.paypal.com", "https://api-m.paypal.com", "https://*.google.com"],
      frameAncestors: ["'self'", "https://ai.studio", "https://*.run.app"], // Embeddable only in trusted domains!
    }
  },
  frameguard: false // Securely managed via frameAncestors directive above
}));

// 2. Cookie Parser with signature protection (Phase 11)
app.use(cookieParser('sou9aljoumla-cookie-secret-2026'));

// 3. Custom Mastercraft CORS Middleware (Phase 9)
const isProdEnv = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  process.env.APP_URL,
  'https://ai.studio',
  'https://ai.studio/build'
].filter(Boolean) as string[];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    if (!isProdEnv) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        securityLogger.warn({ event: 'CORS_BLOCKED', origin, path: req.path });
        return res.status(403).json({ error: 'CORS Blocked: Origin unauthorized.' });
      }
    }
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Enterprise Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  if (isProdEnv) {
    // 2-Year HSTS header with subdomains and preloading
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 4. Rate Limiter configurations (Phase 7 - Security Hardening according to OWASP)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // 5 attempts per 15 mins
  message: { error: 'عذراً، تم تجاوز الحد المسموح لمحاولات تسجيل الدخول. يرجى الانتظار 15 دقيقة والمحاولة ثانية.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: 'LOGIN_RATE_LIMITED', ip: req.ip });
    res.status(429).json(options.message);
  }
});

export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // 10 attempts per 15 mins
  message: { error: 'عذراً، تم تجاوز الحد المسموح لمحاولات التسجيل. يرجى الانتظار 15 دقيقة والمحاولة مجدداً.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: 'REGISTRATION_RATE_LIMITED', ip: req.ip });
    res.status(429).json(options.message);
  }
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // 10 attempts per 15 mins
  message: { error: 'عذراً، تم تجاوز الحد المسموح لمحاولات استرداد كلمة المرور. يرجى الانتظار 15 دقيقة والمحاولة مجدداً.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: 'RESET_PASSWORD_RATE_LIMITED', ip: req.ip });
    res.status(429).json(options.message);
  }
});

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // 100 requests per 15 mins
  message: { error: 'عذراً، تم تجاوز الحد الأقصى للمحاولات والطلبات الآمنة. يرجى المحاولة بعد 15 دقيقة.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: 'API_RATE_LIMITED', ip: req.ip, path: req.path });
    res.status(429).json(options.message);
  }
});

export const paypalVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: 'عذراً، تم تجاوز الحد المسموح لمحاولات التحقق من الدفع. يرجى الانتظار 5 دقائق والمحاولة مجدداً.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: 'PAYPAL_VERIFICATION_RATE_LIMITED', ip: req.ip });
    res.status(429).json(options.message);
  }
});

export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: 'WEBHOOK_RATE_LIMITED', ip: req.ip });
    res.status(429).json(options.message);
  }
});

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'عذراً، تم تجاوز حد الطلبات المسموح للوحة التحكم. يرجى المحاولة وقت لاحق.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    securityLogger.warn({ event: 'ADMIN_ROUTE_RATE_LIMITED', ip: req.ip, path: req.path });
    res.status(429).json(options.message);
  }
});

// Custom CSRF and Origin Protection middleware (CSRF Protection according to OWASP Top 10)
export function csrfAndOriginProtection(req: express.Request, res: express.Response, next: express.NextFunction) {
  const method = req.method;
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const origin = req.headers.origin || req.headers.referer;
    const host = req.headers.host;
    if (origin && host) {
      try {
        const originUrl = new URL(origin.startsWith('/') ? `http://${host}${origin}` : origin);
        const isAllowed = 
          originUrl.host === host || 
          originUrl.host.includes('run.app') || 
          originUrl.host.includes('localhost') || 
          originUrl.host.includes('127.0.0.1');

        if (!isAllowed) {
          securityLogger.warn({ event: 'CSRF_ORIGIN_MISMATCH_BLOCKED', origin, host });
          return res.status(403).json({ error: 'حظر الاتصال: المحاولة غير مصرح بها من مصدر خارجي (حماية CSRF).' });
        }
      } catch (err) {
        // ignore malformed URLs safely
      }
    }
  }
  next();
}

// Custom IDOR and Authorization Protection middleware (IDOR Protection according to OWASP Top 10)
export function authorizeOwnership(req: express.Request, res: express.Response, next: express.NextFunction) {
  const sessionUser = req.sessionUser;
  if (!sessionUser) {
    return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول للقيام بهذا الإجراء.' });
  }

  // Extract resource userId to check ownership matches
  const targetUserId = req.params.userId || req.body.userId || req.query.userId || req.body.sellerId;
  
  if (targetUserId && sessionUser.role !== 'superadmin' && sessionUser.role !== 'admin' && sessionUser.userId !== targetUserId) {
    securityLogger.warn({
      event: 'IDOR_PREVENTED',
      sessionUserId: sessionUser.userId,
      requestedUserId: targetUserId,
      path: req.path
    });
    return res.status(403).json({ error: 'عذراً، لا تمتلك الصلاحيات الكافية لإتمام هذا الإجراء لحساب آخر (IDOR Protection).' });
  }
  next();
}

// Apply rate limits and session resolution
app.use('/api/admin', adminLimiter);

// Resolve active session from secure cookie if available on any API call
app.use((req, res, next) => {
  const token = req.cookies?.s9_session;
  if (token) {
    const session = sessionStore.get(token);
    if (session && Date.now() < session.expiresAt) {
      const user = dbInstance.getUsers().find(u => u.id === session.userId);
      if (user) {
        // 1. Session Revocation List check
        const isRevoked = revokedSessions.some(rs => rs.sessionId === token);
        if (isRevoked) {
          sessionStore.delete(token);
          res.clearCookie('s9_session');
          return next();
        }

        // 2. Password version mismatch / update validation
        const currentVersion = user.passwordVersion || 0;
        const sessionVersion = session.passwordVersion || 0;
        if (sessionVersion !== currentVersion) {
          sessionStore.delete(token);
          res.clearCookie('s9_session');
          return next();
        }

        // 3. User is Admin extra protections: Device Fingerprint and IP Replay prevention
        if (user.isAdmin || user.role === 'admin' || user.role === 'superadmin') {
          const fingerprint = generateDeviceFingerprint(req);
          const currentIp = getClientIp(req);

          if (session.deviceFingerprint && session.deviceFingerprint !== fingerprint) {
            sessionStore.delete(token);
            res.clearCookie('s9_session');
            return res.status(401).json({ error: 'تم إنهاء الجلسة بسبب الكشف عن بصمة جهاز مختلفة لحساب مدير.' });
          }

          if (session.ipAddress && session.ipAddress !== currentIp) {
            sessionStore.delete(token);
            res.clearCookie('s9_session');
            return res.status(401).json({ error: 'تم إنهاء الجلسة بسبب الكشف عن محاولة استخدام توكن من عنوان IP مختلف لحساب مدير.' });
          }
        }

        session.expiresAt = Date.now() + 2 * 60 * 60 * 1000; // extend / rotate
        req.sessionUser = session;
      } else {
        sessionStore.delete(token);
        res.clearCookie('s9_session');
      }
    }
  }
  next();
});

// Middleware to block all api requests (except allowed forced routes) if logged-in admin needs password change
app.use((req, res, next) => {
  if (req.sessionUser) {
    const user = dbInstance.getUsers().find(u => u.id === req.sessionUser.userId);
    if (user && user.isAdmin && user.mustChangePassword) {
      const allowedRoutesDuringForce = [
        "/api/auth/force-change-password"
      ];
      if (req.path.startsWith('/api/') && !allowedRoutesDuringForce.includes(req.path)) {
        dbInstance.getAuditLogs().push({
          id: 'aud-' + Math.random().toString(36).substr(2, 9),
          adminId: user.id,
          adminEmail: user.email,
          adminName: user.name,
          action: 'ADMIN_FORCE_ACCESS_BLOCKED',
          ip: getClientIp(req),
          details: `تم منع وصول المشرف ذي المعرف ${user.id} للمسار المفتوح ${req.path} أثناء تغيير كلمة المرور الإلزامية لفرض حماية الـ bypass.`,
          createdAt: new Date().toISOString()
        });
        dbInstance.persist();

        return res.status(403).json({
          error: "PASSWORD_CHANGE_REQUIRED",
          forcePasswordChange: true,
          redirect: "/admin-change-password",
          lockNavigation: true,
          message: "يجب تغيير كلمة المرور للمدير قبل إتمام أي عملية أخرى."
        });
      }
    }
  }
  next();
});

// Apply CSRF and Origin Protection to all API routes (CSRF Protection according to OWASP Top 10)
app.use(csrfAndOriginProtection);

// Helper validation on admin endpoints to safeguard against unauthorized requests (Authorization Security)
export function enforceAdminSession(req: express.Request, res: express.Response, next: express.NextFunction) {
  // 1. Session check
  if (!req.sessionUser) {
    return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول للحصول على صلاحيات الجلسة لتأدية الإجراء.' });
  }

  // 2. Validate session and prevent actor mismatch / spoofing
  const actorId = req.body.adminId || req.body.callerId || req.query.adminId || req.query.callerId;
  if (actorId && req.sessionUser.userId !== actorId) {
    securityLogger.warn({
      event: 'SESSION_MISMAPPED_HIJACK_BLOCK',
      sessionUserId: req.sessionUser.userId,
      payloadActorId: actorId,
      path: req.path
    });
    return res.status(403).json({ error: 'خطأ أمني: كاشف التلاعب بالجلسة نشط. تم منع طلبك نظراً لفرط تشابه الهويات غير المصرح بها.' });
  }

  // 3. Core Role-Based Access Control (RBAC Verification) - Authorization Security
  const role = req.sessionUser.role;
  if (role !== 'superadmin' && role !== 'admin' && role !== 'moderator') {
    return res.status(403).json({ error: 'خطأ في الصلاحيات: ليس لديك الصلاحيات اللازمة للوصول إلى هذا القسم.' });
  }

  // 4. Specific Moderator constraints (Phase 10 / Authorization rules)
  const isWriteRoute = req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE';
  const pathLower = req.path.toLowerCase();

  if (role === 'moderator') {
    const blockedKeywords = [
      'settings', 'packages', 'payment-settings', 'cloudflare-settings', 'roles/change', 'recharge-codes', 'coupons'
    ];
    const isBlocked = blockedKeywords.some(kw => pathLower.includes(kw));
    if (isBlocked && isWriteRoute) {
      securityLogger.warn({
        event: 'MODERATOR_PRIVILEGE_ESCALATION_VIOLATION',
        userId: req.sessionUser.userId,
        path: req.path,
        ip: req.ip
      });
      return res.status(403).json({ error: 'عذراً، رتبة مساعد المشرف (Moderator) غير مخولة بتعديل الباقات أو الإعدادات المالية والبرمجية للمنصة.' });
    }
  }

  // 5. Admin role escalation lock (Prevent ordinary admins from assigning superadmin roles)
  if (role === 'admin' && pathLower.includes('roles/change') && isWriteRoute) {
    const targetRole = req.body.role;
    if (targetRole === 'superadmin' || targetRole === 'admin') {
      securityLogger.warn({
        event: 'ADMIN_PRIVILEGE_ESCALATION_ATTEMPT',
        userId: req.sessionUser.userId,
        targetRole,
        ip: req.ip
      });
      return res.status(403).json({ error: 'عذراً، لا تمتلك رتبة مدير (Admin) الصلاحية لترقية الأعضاء إلى رتب القيادة العليا (Super Admin).' });
    }
  }

  next();
}

// Register global admin access firewall middleware on all dashboard endpoints (JWT/Session State Validation)
app.use('/api/admin', enforceAdminSession);

// Create uploads folder inside data directory if it doesn't exist
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically before any Vite logic
app.use('/uploads', express.static(UPLOADS_DIR));

// Body parsing with limits to support Base64 image & video uploads (max 150MB)
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// Block all requests that specify adminId/callerId of an unverified first-login administrator (General Manager/Admin)
app.use((req, res, next) => {
  if (req.path === '/api/auth/force-change-password') {
    return next();
  }
  const adminId = req.query.adminId || req.body.adminId || req.query.callerId || req.body.callerId || req.query.userId || req.body.userId;
  if (adminId && typeof adminId === 'string') {
    const passwordChanged = dbInstance.getPasswordChanged();
    if (passwordChanged[adminId] === false) {
      const users = dbInstance.getUsers();
      const user = users.find(u => u.id === adminId);
      if (user && (user.role === 'superadmin' || user.role === 'admin')) {
        return res.status(403).json({ error: 'عذراً، يجب تغيير كلمة المرور الافتراضية للمدير العام أولاً لتتمكن من تصفح المنصة أو استخدام لوحة التحكم.' });
      }
    }
  }
  next();
});

// Temporary memory map to secure security SMS-OTP for later password modifications
const securityOtps = new Map<string, { code: string; expiresAt: number }>();

// Cache for unique view tracking (productId -> Map of trackingKey -> timestamp)
const PRODUCT_VISITS_FILE = path.join(process.cwd(), 'data', 'product_visits.json');
const productVisitsCache = new Map<string, Map<string, number>>();

function loadVisitsCache() {
  try {
    if (fs.existsSync(PRODUCT_VISITS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PRODUCT_VISITS_FILE, 'utf8'));
      for (const [prodId, mapData] of Object.entries(data)) {
        const innerMap = new Map<string, number>();
        for (const [trackKey, timestamp] of Object.entries(mapData as Record<string, number>)) {
          innerMap.set(trackKey, timestamp);
        }
        productVisitsCache.set(prodId, innerMap);
      }
    }
  } catch (err) {
    console.error('Error loading product visits cache:', err);
  }
}

function saveVisitsCache() {
  try {
    const obj: Record<string, Record<string, number>> = {};
    for (const [prodId, innerMap] of productVisitsCache.entries()) {
      obj[prodId] = {};
      for (const [trackKey, timestamp] of innerMap.entries()) {
        obj[prodId][trackKey] = timestamp;
      }
    }
    fs.writeFileSync(PRODUCT_VISITS_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving product visits cache:', err);
  }
}

// Call loadVisitsCache on server startup
loadVisitsCache();

// Helper structure to fetch client IP
function getClientIp(req: express.Request): string {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  return Array.isArray(ip) ? ip[0] : String(ip).split(',')[0];
}

// -----------------------------------------------------------------------------
// ENTERPRISE-GRADE ADMIN PASSWORD PROTECTION LAYERS
// -----------------------------------------------------------------------------

export function generateDeviceFingerprint(req: express.Request): string {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(ip + '|' + userAgent).digest('hex');
}

export const revokedSessions: Array<{ sessionId: string; reason: string; timestamp: string }> = [];

export function revokeAllSessions(userId: string, reason = 'MANDATORY_PASSWORD_CHANGE') {
  for (const [token, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessionStore.delete(token);
      revokedSessions.push({
        sessionId: token,
        reason,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const authFlowLocks = new Set<string>();

export function lockAuthFlow(userId: string): boolean {
  if (authFlowLocks.has(userId)) {
    return false;
  }
  authFlowLocks.add(userId);
  return true;
}

export function unlockAuthFlow(userId: string) {
  authFlowLocks.delete(userId);
}

// Helper to automatically check and clean expired Premium ads (Active >= 3 days / 72 hours)
function checkAndCleanExpiredPremiums(): void {
  try {
    const now = new Date();
    let hasChanges = false;
    const products = dbInstance.getProducts();
    
    products.forEach(p => {
      if (p.isFeatured || p.is_premium) {
        const premiumTime = p.premium_created_at ? new Date(p.premium_created_at) : new Date(p.createdAt);
        const ageInMs = now.getTime() - premiumTime.getTime();
        const ageInDays = ageInMs / (1000 * 60 * 60 * 24);
        
        if (ageInDays >= 3) {
          p.isFeatured = false;
          p.is_premium = false;
          hasChanges = true;
        } else {
          // Synchronize fields for consistency
          if (!p.is_premium) {
            p.is_premium = true;
            hasChanges = true;
          }
          if (!p.premium_created_at) {
            p.premium_created_at = p.createdAt;
            hasChanges = true;
          }
          if (!p.isFeatured) {
            p.isFeatured = true;
            hasChanges = true;
          }
        }
      }
    });

    if (hasChanges) {
      dbInstance.persist();
    }
  } catch (err) {
    console.error('Error during checkAndCleanExpiredPremiums:', err);
  }
}

// REST APIs
// 1. Auth Setup
function isAdminRole(role: string): boolean {
  if (!role) return false;
  const n = role.trim().toLowerCase().replace(/[\s\-_]+/g, '');
  return n === 'admin' || n === 'superadmin' || n === 'owner';
}

// Helper functions of validation on Full Name, Phone, and Email
function validateFullName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'الاسم الكامل مطلوب';
  }
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 2) {
    return 'الاسم غير صالح. يرجى إدخال اسم حقيقي مكون من كلمتين على الأقل (الاسم الثاني واللقب)';
  }

  // Detect numeric only or mostly numeric
  if (/^\d+$/.test(trimmed.replace(/\s+/g, ''))) {
    return 'الاسم غير صالح. الاسم لا يمكن أن يتكون من أرقام فقط';
  }

  // Special characters validation: Only Arabic letters, Latin letters, French accent letters, and spaces are allowed
  const nameRegex = /^[a-zA-Z\u0600-\u06FFàâæçéèêëîïôœùûüÿÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ\s]+$/;
  if (!nameRegex.test(trimmed)) {
    return 'الاسم غير صالح. غير مسموح باستخدام الأرقام أو الرموز الخاصة';
  }

  // Check for spam words
  const spamWords = ['test', 'testing', 'admin', 'user', 'qwerty', 'asdasd', 'juhjdijed', 'abc123', '123456'];
  const hasSpam = words.some(w => {
    const lw = w.toLowerCase();
    return spamWords.includes(lw) || lw.length < 2;
  });
  if (hasSpam) {
    return 'الاسم غير صالح. يحتوي على كلمات عشوائية أو تجريبية غير مقبولة';
  }

  // Check for 4 or more repeated letters
  if (/([a-zA-Z\u0600-\u06FF])\1\1\1/i.test(trimmed)) {
    return 'الاسم غير صالح. الاسم يحتوي على أحرف مكررة عشوائية غير منطقية';
  }

  return null;
}

function validatePhoneNumber(phone: string): string | null {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return 'رقم الهاتف للتواصل مطلوب';
  }
  // Remove spaces, hyphens, parentheses to let users format cleanly
  const cleaned = trimmed.replace(/[\s\-()]+/g, '');
  if (/[a-zA-Z]/i.test(cleaned)) {
    return 'رقم الهاتف غير صالح. لا يسمح بإدخال حروف أو رموز خاصة غير مقبولة';
  }
  // Moroccan phone number starts with 05, 06 or 07 with international prefix compatibility
  const moroccanPhoneRegex = /^(?:0|\+212|00212)[567]\d{8}$/;
  if (!moroccanPhoneRegex.test(cleaned)) {
    return 'رقم الهاتف غير صالح. يجب أن يكون رقم هاتف مغربي حقيقي مكون من 10 أرقام (بدءاً بـ 06 أو 07 أو 05) أو بالصيغة الدولية (+212)';
  }
  return null;
}

function validateAddress(address: string): string | null {
  const trimmed = (address || '').trim();
  if (!trimmed) {
    return 'عنوان الشحن والتسليم مطلوب بالكامل';
  }
  if (trimmed.length < 10) {
    return 'عنوان الشحن قصير جداً. يرجى إدخال عنوان حقيقي ومفصل (اسم الحي، رقم عمارة/منزل، الشقة والمدينة) لضمان التوصيل السليم لبضاعة الجملة.';
  }
  if (/(.)\1\1\1\1\1/.test(trimmed)) {
    return 'العنوان المدخل غير مالي أو غير منطقي. يرجى كتابة تفاصيل حقيقية للعنوان لتأمين الشحن.';
  }
  return null;
}

function validateEmailAddress(email: string): string | null {
  const trimmed = (email || '').trim().toLowerCase();
  if (!trimmed) {
    return 'البريد الإلكتروني للشركة مطلوب';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'البريد الإلكتروني غير صالح. صيغة البريد مدخلة بشكل غير صحيح';
  }
  const domain = trimmed.split('@')[1];
  if (!domain) {
    return 'تأكد من كتابة نطاق البريد الإلكتروني بشكل صحيح';
  }
  const disposableKeywords = [
    'mailinator', 'tempmail', 'guerrillamail', '10minutemail', 
    'yopmail', 'throwaway', 'disposable', 'temp-mail', 'trashmail',
    'getairmail', 'sharklasers', 'guerrillamailblock', 'pokemail', 
    'dispostable', 'fakeinbox', 'generator'
  ];
  const isDisposable = disposableKeywords.some(keyword => domain.includes(keyword));
  if (isDisposable) {
    return 'البريد الإلكتروني مؤقت وغير مسموح به بالمنصة لتفادي الحسابات الوهمية';
  }
  return null;
}

// In-Memory Database for active validation structures
interface RateLimitRecord {
  timestamps: number[];
}
const registerRateLimits = new Map<string, RateLimitRecord>();
const otpRateLimits = new Map<string, RateLimitRecord>();
const forgotRateLimits = new Map<string, RateLimitRecord>();
const redeemRateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(key: string, limitMap: Map<string, RateLimitRecord>, maxHits: number, windowMs: number): boolean {
  const now = Date.now();
  const record = limitMap.get(key) || { timestamps: [] };
  record.timestamps = record.timestamps.filter(t => now - t < windowMs);
  if (record.timestamps.length >= maxHits) {
    return false;
  }
  record.timestamps.push(now);
  limitMap.set(key, record);
  return true;
}

interface OtpInfo {
  code: string;
  expiresAt: number;
}
const emailOtps = new Map<string, OtpInfo>();
const recoveryOtps = new Map<string, OtpInfo>();

app.post('/api/auth/register', registerLimiter, async (req, res) => {
  try {
    const { email, name, role, phone, whatsapp, city, password, referredBy } = req.body;

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rateLimitKey = `${ip}-${email || ''}`;
    if (!checkRateLimit(rateLimitKey, registerRateLimits, 5, 10 * 60 * 1000)) {
      return res.status(429).json({ error: 'تم تجاوز الحد المسموح لمحاولات التسجيل. يرجى الانتظار 10 دقائق والمحاولة مجدداً.' });
    }

    if (!email || !name || !role || !phone || !whatsapp || !city || !password) {
      return res.status(400).json({ error: 'عذراً، يرجى ملء جميع الحقول المطلوبة' });
    }

    const nameErr = validateFullName(name);
    if (nameErr) return res.status(400).json({ error: nameErr });

    const phoneErr = validatePhoneNumber(phone);
    if (phoneErr) return res.status(400).json({ error: phoneErr });

    const emailErr = validateEmailAddress(email);
    if (emailErr) return res.status(400).json({ error: emailErr });

    const passErr = validateStrongPassword(password);
    if (passErr) return res.status(400).json({ error: passErr });

    const users = dbInstance.getUsers();
    const passwords = dbInstance.getPasswords();
    const passwordChanged = dbInstance.getPasswordChanged();

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم مسبقاً' });
    }

    if (users.find(u => (u.phone || '').trim() === phone.trim())) {
      return res.status(400).json({ error: 'رقم الهاتف مستخدم مسبقاً' });
    }

    const userId = 'u-' + Math.random().toString(36).substr(2, 9);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';
    for (let i = 0; i < 9; i++) {
      referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    let points = 200; 
    const referralTx: WalletTransaction[] = [];

    let referrerUser: User | undefined;
    if (referredBy) {
      referrerUser = users.find(u => u.referralCode === referredBy);
      if (referrerUser && referrerUser.id !== userId) {
        points += 60;
        referrerUser.points += 120;

        const refTxId1 = 'tx-' + Math.random().toString(36).substr(2, 9);
        dbInstance.getWalletTransactions().push({
          id: refTxId1,
          userId: referrerUser.id,
          type: 'credit',
          amount: 0,
          points: 120,
          description: `مكافأة إحالة مستخدم جديد: ${name}`,
          createdAt: new Date().toISOString(),
          status: 'completed'
        });

        const refTxId2 = 'tx-' + Math.random().toString(36).substr(2, 9);
        referralTx.push({
          id: refTxId2,
          userId,
          type: 'credit',
          amount: 0,
          points: 60,
          description: `مكافأة التسجيل عبر كود الإحالة الخاص بالبائع: ${referrerUser.name}`,
          createdAt: new Date().toISOString(),
          status: 'completed'
        });
      }
    }

    const companyName = role === 'seller' ? `${name} للجملة` : undefined;
    const companyLogo = role === 'seller' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200' : undefined;
    const companyBanner = role === 'seller' ? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200' : undefined;
    const companyDesc = role === 'seller' ? 'بائع جملة ومورد موثوق لتقديم أجود السلع والخدمات بأفضل الأسعار.' : undefined;

    const isAdmin = isAdminRole(role);
    const newUser: User = {
      id: userId,
      email,
      name,
      role,
      phone,
      whatsapp,
      city,
      points,
      referralCode,
      referredBy: referrerUser?.referralCode,
      createdAt: new Date().toISOString(),
      isVerified: isAdmin ? true : false,
      status: isAdmin ? 'active' : 'pending_verification', 
      companyName,
      companyLogo,
      companyBanner,
      companyDesc,
      badges: role === 'seller' ? ['New Seller'] : []
    };

    users.push(newUser);
    passwords[userId] = hashPassword(password);
    passwordChanged[userId] = true;

    dbInstance.getWalletTransactions().push({
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      userId,
      type: 'credit',
      amount: 0,
      points: 200,
      description: 'مكافأة الترحيب للتسجيل الجديد في Sou9AlJoumla',
      createdAt: new Date().toISOString(),
      status: 'completed'
    });

    if (referralTx.length > 0) {
      dbInstance.getWalletTransactions().push(...referralTx);
    }

    if (isAdmin) {
      dbInstance.persist();
      const sessionToken = crypto.randomBytes(32).toString('hex');
      sessionStore.set(sessionToken, {
        userId: newUser.id,
        role: newUser.role,
        passwordVersion: newUser.passwordVersion || 0,
        deviceFingerprint: generateDeviceFingerprint(req),
        ipAddress: getClientIp(req),
        expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
      });
      setSessionCookie(res, sessionToken);

      res.json({ 
        success: true, 
        pendingVerification: false, 
        email,
        user: newUser 
      });
    } else {
      const code = generateOTP();
      emailOtps.set(email.toLowerCase(), {
        code,
        expiresAt: Date.now() + 15 * 60 * 1000 
      });

      // Unified robust core OTP service
      await sendOTP(newUser, code, "REGISTER", getClientIp(req));

      dbInstance.persist();

      res.json({ 
        success: true, 
        pendingVerification: true, 
        email,
        otpCodeSimulated: code, 
        user: newUser 
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Resend OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'البريد الإلكتروني مطلوب لإعادة الإرسال' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rateLimitKey = `${ip}-${email.toLowerCase()}`;
    if (!checkRateLimit(rateLimitKey, otpRateLimits, 3, 5 * 60 * 1000)) {
      return res.status(429).json({ error: 'تم تجاوز الحد المسموح لطلبات الرموز. يرجى الانتظار 5 دقائق والمحاولة مجدداً.' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'البريد الإلكتروني المدخل غير مسجل بالمنصة' });
    }

    const code = generateOTP();
    emailOtps.set(email.toLowerCase(), {
      code,
      expiresAt: Date.now() + 15 * 60 * 1000
    });

    // Unified robust core OTP service
    await sendOTP(user, code, "REGISTER", getClientIp(req));

    res.json({ success: true, email, otpCodeSimulated: code });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'البريد الإلكتروني والرمز حقول مطلوبة بالكامل' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير مسجل بالمنصة' });
    }

    try {
      await verifyOTP(user.id, code, "REGISTER", getClientIp(req));
    } catch (verifyErr: any) {
      return res.status(400).json({ error: verifyErr.message });
    }

    user.status = 'active';
    dbInstance.persist();
    emailOtps.delete(email.toLowerCase());

    const sessionToken = crypto.randomBytes(32).toString('hex');
    sessionStore.set(sessionToken, {
      userId: user.id,
      role: user.role,
      passwordVersion: user.passwordVersion || 0,
      deviceFingerprint: generateDeviceFingerprint(req),
      ipAddress: getClientIp(req),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    });
    setSessionCookie(res, sessionToken);

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password Request
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'البريد الإلكتروني غير ممتلئ للمواصلة' });
    }

    const emailErr = validateEmailAddress(email);
    if (emailErr) {
      return res.status(400).json({ error: emailErr });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rateLimitKey = `${ip}-${email.toLowerCase()}`;
    if (!checkRateLimit(rateLimitKey, forgotRateLimits, 3, 5 * 60 * 1000)) {
      return res.status(429).json({ error: 'لقد تجاوزت حد طلبات استعادة كلمة المرور المسموح به. الرجاء الانتظار 5 دقائق.' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'البريد الإلكتروني المدخل غير مسجل لدينا في النظام' });
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    let timestamps = user.passwordResetTimestamps || [];
    timestamps = timestamps.filter(t => new Date(t).getTime() > oneDayAgo);
    user.passwordResetTimestamps = timestamps;

    if (timestamps.length >= 3 && !isAdminRole(user.role)) {
      return res.status(400).json({ error: 'تم تجاوز الحد المسموح لتغيير كلمة المرور. لا يمكنك تغيير كلمة المرور أكثر من 3 مرات خلال 24 ساعة.' });
    }

    const recoveryCode = generateOTP();
    recoveryOtps.set(email.toLowerCase(), {
      code: recoveryCode,
      expiresAt: Date.now() + 15 * 60 * 1000 
    });

    // Unified robust core OTP service
    await sendOTP(user, recoveryCode, "RESET_PASSWORD", getClientIp(req));

    const isGM = user.role === 'superadmin' || user.id === 'u-admin';
    res.json({ success: true, email, otpCodeSimulated: recoveryCode, isGMAccount: isGM });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Recovery Code
app.post('/api/auth/verify-recovery', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'المعلومات غير كاملة للمتابعة' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'البريد الإلكتروني غير مسجل بالمنصة' });
    }

    try {
      await verifyOTP(user.id, code, "RESET_PASSWORD", getClientIp(req), undefined, false);
    } catch (verifyErr: any) {
      return res.status(400).json({ error: verifyErr.message });
    }

    res.json({ success: true, verified: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password Core
app.post('/api/auth/reset-password', resetPasswordLimiter, async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'الرجاء ملء جميع المعطيات لتوليد كلمة المرور الجديدة' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'تعذر العثور على صاحب هذا البريد المستهدف في قاعدة البيانات.' });
    }

    try {
      await verifyOTP(user.id, code, "RESET_PASSWORD", getClientIp(req), undefined, true);
    } catch (verifyErr: any) {
      return res.status(400).json({ error: verifyErr.message });
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    let timestamps = user.passwordResetTimestamps || [];
    timestamps = timestamps.filter(t => new Date(t).getTime() > oneDayAgo);

    if (timestamps.length >= 3 && !isAdminRole(user.role)) {
      return res.status(400).json({ error: 'لقد تجاوزت الحد الأقصى لتغيير كلمة المرور. لا يمكنك تغيير كلمة المرور أكثر من 3 مرات خلال 24 ساعة.' });
    }

    const passwords = dbInstance.getPasswords();
    const passwordChanged = dbInstance.getPasswordChanged();

    passwords[user.id] = hashPassword(newPassword);
    passwordChanged[user.id] = true;

    timestamps.push(new Date().toISOString());
    user.passwordResetTimestamps = timestamps;
    user.passwordResetCount = (user.passwordResetCount || 0) + 1;

    recoveryOtps.delete(email.toLowerCase());

    dbInstance.persist();

    res.json({ success: true, message: 'تم إعادة تعيين كلمة المرور وربطها بالحساب بنجاح!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const loginFailures = new Map<string, { count: number; lockedUntil: number }>();

app.post('/api/auth/login', loginLimiter, (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
    }

    // Check account locking (Authentication Security)
    const failureRecord = loginFailures.get(email.toLowerCase()) || { count: 0, lockedUntil: 0 };
    if (failureRecord.lockedUntil > Date.now()) {
      const remainingMin = Math.ceil((failureRecord.lockedUntil - Date.now()) / 60000);
      securityLogger.warn({ event: 'LOGIN_ATTEMPT_ON_LOCKED_ACCOUNT', email, ip: req.ip });
      return res.status(403).json({ error: `تم قفل هذا الحساب مؤقتاً لكثرة المحاولات الفاشلة. يرجى الانتظار ${remainingMin} دقيقة والمحاولة ثانية.` });
    }

    const users = dbInstance.getUsers();
    const passwords = dbInstance.getPasswords();
    const passwordChanged = dbInstance.getPasswordChanged();

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      securityLogger.warn({ event: 'LOGIN_ATTEMPT_USER_NOT_FOUND', email, ip: req.ip });
      return res.status(400).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'عذراً، هذا الحساب موقوف حالياً من قبل الإدارة' });
    }

    const isUserAdmin = isAdminRole(user.role);

    if (isUserAdmin) {
      user.isAdmin = true;
      if (!user.firstLoginDone) {
        user.mustChangePassword = true;
      }
      if (user.status === 'pending_verification' || !user.isVerified) {
        user.status = 'active';
        user.isVerified = true;
        dbInstance.persist();
      }
    } else if (user.status === 'pending_verification') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      emailOtps.set(email.toLowerCase(), {
        code,
        expiresAt: Date.now() + 15 * 60 * 1000
      });
      console.log(`[SIMULATED EMAIL SERVICE] Login Verification OTP for ${email}: ${code}`);
      return res.status(401).json({ 
        error: 'عذراً، هذا الحساب لم يتم تفعيله بعد. يرجى إدخال رمز التحقق OTP للتفعيل.',
        pendingVerification: true,
        email: user.email,
        otpCodeSimulated: code
      });
    }

    // Match password
    if (!comparePassword(user.id, password, passwords[user.id])) {
      const failedCount = failureRecord.count + 1;
      let lockTime = 0;
      if (failedCount >= 5) {
        lockTime = Date.now() + 15 * 60 * 1000; // 15 mins lock
      }
      loginFailures.set(email.toLowerCase(), { count: failedCount, lockedUntil: lockTime });
      
      securityLogger.warn({ 
        event: 'LOGIN_PASSWORD_MISMATCH', 
        email: email.toLowerCase(), 
        failedCount, 
        locked: failedCount >= 5, 
        ip: req.ip 
      });

      return res.status(400).json({ 
        error: failedCount >= 5 
          ? 'تم قفل هذا الحساب مؤقتاً لكثرة المحاولات الفاشلة. يرجى الانتظار 15 دقيقة ثانية.' 
          : 'اسم المستخدم أو كلمة المرور غير صحيحة' 
      });
    }

    // Successful login - clear failures tracking
    loginFailures.delete(email.toLowerCase());

    // Force change password in first entry only
    if (user.isAdmin && user.mustChangePassword) {
      dbInstance.getAuditLogs().push({
        id: 'aud-' + Math.random().toString(36).substr(2, 9),
        adminId: user.id,
        adminEmail: user.email,
        adminName: user.name,
        action: 'ADMIN_FIRST_LOGIN_TRIGGERED',
        ip: getClientIp(req),
        details: 'تم رصد الدخول الأول للمسؤول والمطالبة بإلزامية تغيير كلمة المرور.',
        createdAt: new Date().toISOString()
      });
      dbInstance.persist();

      return res.status(403).json({
        forcePasswordChange: true,
        requirePasswordChange: true,
        userId: user.id,
        email: user.email,
        name: user.name,
        redirect: "/admin-change-password",
        lockNavigation: true,
        error: "يجب تغيير كلمة المرور في أول دخول فقط",
        message: "يجب تغيير كلمة المرور في أول دخول فقط"
      });
    }

    // Legacy fallback check if needed
    if ((user.role === 'admin' || user.role === 'superadmin') && passwordChanged[user.id] === false) {
      user.mustChangePassword = true;
      dbInstance.getAuditLogs().push({
        id: 'aud-' + Math.random().toString(36).substr(2, 9),
        adminId: user.id,
        adminEmail: user.email,
        adminName: user.name,
        action: 'ADMIN_FIRST_LOGIN_TRIGGERED',
        ip: getClientIp(req),
        details: 'تم رصد الدخول الأول للمسؤول والمطالبة بإلزامية تغيير كلمة المرور (Legacy check).',
        createdAt: new Date().toISOString()
      });
      dbInstance.persist();

      return res.status(403).json({
        forcePasswordChange: true,
        requirePasswordChange: true,
        userId: user.id,
        email: user.email,
        name: user.name,
        redirect: "/admin-change-password",
        lockNavigation: true,
        error: "يجب تغيير كلمة المرور في أول دخول فقط",
        message: "يجب تغيير كلمة المرور في أول دخول فقط"
      });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    sessionStore.set(sessionToken, {
      userId: user.id,
      role: user.role,
      passwordVersion: user.passwordVersion || 0,
      deviceFingerprint: generateDeviceFingerprint(req),
      ipAddress: getClientIp(req),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    });
    setSessionCookie(res, sessionToken);

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/force-change-password', (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'المعطيات غير مكتملة لتحديث كلمة المرور' });
  }

  const users = dbInstance.getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'مستخدم غير موجود' });
  }

  // 1. Race condition locking
  if (user.mustChangePassword) {
    if (!lockAuthFlow(user.id)) {
      return res.status(429).json({ error: 'تم كشف عملية تغيير كلمة مرور جارية بالفعل لهذا الحساب.' });
    }
  }

  try {
    const passErr = validateStrongPassword(newPassword);
    if (passErr) {
      return res.status(400).json({ error: passErr });
    }

    const passwords = dbInstance.getPasswords();
    const passwordChanged = dbInstance.getPasswordChanged();

    // 2. Revoke all active sessions of this user
    revokeAllSessions(userId);

    passwords[userId] = hashPassword(newPassword);
    passwordChanged[userId] = true; // Password changed status set to true

    user.passwordVersion = (user.passwordVersion || 0) + 1;
    user.passwordChangedManually = true;
    user.firstLoginDone = true;
    user.mustChangePassword = false;
    user.isAdmin = true;

    // Log admin change password (and audit target logs)
    if (user.role === 'admin' || user.role === 'superadmin') {
      dbInstance.getAuditLogs().push({
        id: 'aud-' + Math.random().toString(36).substr(2, 9),
        adminId: user.id,
        adminEmail: user.email,
        adminName: user.name,
        action: 'ADMIN_PASSWORD_CHANGED',
        ip: getClientIp(req),
        details: 'تم بنجاح تغيير كلمة المرور الإلزامية للمشرف لأول مرة وتحديث رقم فحص الجلسات لتعطيل الجلسات القديمة.',
        createdAt: new Date().toISOString()
      });
      // also log legacy action for backward compatibility
      dbInstance.getAuditLogs().push({
        id: 'aud-' + Math.random().toString(36).substr(2, 9),
        adminId: user.id,
        adminEmail: user.email,
        adminName: user.name,
        action: 'تغيير كلمة المرور الإلزامية للمدير',
        ip: getClientIp(req),
        details: 'تم إجراء تحديث كلمة المرور التلقائية بنجاح للمرة الأولى.',
        createdAt: new Date().toISOString()
      });
    }

    dbInstance.persist();

    // Auto-login: issue session token with current passwordVersion, fingerprint & ip so they are authenticated on first entry
    const sessionToken = crypto.randomBytes(32).toString('hex');
    sessionStore.set(sessionToken, {
      userId: user.id,
      role: user.role,
      passwordVersion: user.passwordVersion,
      deviceFingerprint: generateDeviceFingerprint(req),
      ipAddress: getClientIp(req),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    });
    setSessionCookie(res, sessionToken);

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  } finally {
    unlockAuthFlow(userId);
  }
});

app.post('/api/auth/update-profile', (req, res) => {
  try {
    const { userId, name, whatsapp, phone, companyName, companyLogo, companyBanner, companyDesc, city, profile_image, banner_image, password, otpCode } = req.body;
    
    // Custom IDOR and session verification for profile updates (OWASP IDOR protection)
    const sessionUser = req.sessionUser;
    if (!sessionUser) {
      return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول للقيام بهذا الإجراء.' });
    }
    if (sessionUser.role !== 'superadmin' && sessionUser.role !== 'admin' && sessionUser.userId !== userId) {
      return res.status(403).json({ error: 'عذراً، لا تمتلك الصلاحية لتحديث حساب هذا المستخدم.' });
    }

    const users = dbInstance.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'المستخدم غير متوفر' });
    }

    const user = users[userIndex];

    // Multi-factor and re-authentication for General Manager profile updates (phone, whatsapp, city, name, image changes)
    const isGM = user.role === 'superadmin' || user.id === 'u-admin';
    if (isGM) {
      const hasSensitiveChange = 
        (phone && phone !== user.phone) || 
        (whatsapp && whatsapp !== user.whatsapp) || 
        (city && city !== user.city) || 
        (name && name !== user.name) ||
        (profile_image !== undefined && profile_image !== user.profile_image) ||
        (banner_image !== undefined && banner_image !== user.banner_image);

      if (hasSensitiveChange) {
        if (!password) {
          return res.status(400).json({ error: 'عذراً، يجب تقديم كلمة المرور الحالية للمسؤول الأول لتأكيد الهوية (Re-authentication).' });
        }
        const passwords = dbInstance.getPasswords();
        if (!comparePassword(user.id, password, passwords[user.id])) {
          return res.status(400).json({ error: 'كلمة المرور الحالية المدخلة لتأكيد الهوية غير صحيحة.' });
        }
        
        if (!otpCode) {
          return res.status(400).json({ error: 'من فضلك أرسل وأدخل الرمز الإضافي المحمي (OTP) المرسل إلى هاتفك 06******46 (مطلوب لحماية حساب الإدارة العامة).' });
        }
        const savedOtp = securityOtps.get(userId);
        if (!savedOtp) {
          return res.status(400).json({ error: 'الرجاء إرسال رمز التحقق (OTP) أولاً والمحاولة من جديد.' });
        }
        if (Date.now() > savedOtp.expiresAt) {
          return res.status(400).json({ error: 'رمز التحقق الثنائي منتهي الصلاحية، يرجى طلب رمز جديد.' });
        }
        if (savedOtp.code !== otpCode.trim()) {
          return res.status(400).json({ error: 'رمز التحقق الثنائي (OTP) غير صحيح لربط الحساب.' });
        }
        // Success: consume OTP code
        securityOtps.delete(userId);
      }
    }

    // Name change constraints check (once every 2 months / 60 days)
    if (name && name !== user.name) {
      const lastUpdateKey = `name_last_update_of_${user.id}`;
      const settings = dbInstance.getSettings();
      const lastUpdateTime = settings[lastUpdateKey] || user.last_name_change_at;
      if (lastUpdateTime) {
        const lastDate = new Date(lastUpdateTime);
        const differenceInDays = (new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
        if (differenceInDays < 60) {
          const daysLeft = Math.ceil(60 - differenceInDays);
          return res.status(400).json({ 
            error: `لا يمكنك تغيير الاسم حالياً. التغيير متاح مرة كل شهرين (60 يوماً)، يتبقى لك ${daysLeft} يوم.` 
          });
        }
      }
      user.name = name;
      user.last_name_change_at = new Date().toISOString();
      settings[lastUpdateKey] = user.last_name_change_at;
    }

    user.phone = phone || user.phone;
    user.whatsapp = whatsapp || user.whatsapp;
    user.city = city || user.city;
    
    // Support profile_image & banner_image directly
    if (profile_image !== undefined) user.profile_image = profile_image;
    if (banner_image !== undefined) user.banner_image = banner_image;

    if (user.role === 'seller') {
      user.companyName = companyName || user.companyName;
      user.companyLogo = profile_image || companyLogo || user.companyLogo;
      user.companyBanner = banner_image || companyBanner || user.companyBanner;
      user.companyDesc = companyDesc || user.companyDesc;
    }
    
    // Ensure company synchronizations
    if (!user.companyLogo && user.profile_image) {
      user.companyLogo = user.profile_image;
    }
    if (!user.companyBanner && user.banner_image) {
      user.companyBanner = user.banner_image;
    }

    // Initialize/sync stats properties if missing
    user.sales_count = user.sales_count !== undefined ? user.sales_count : 0;
    user.rating = user.rating !== undefined ? user.rating : (user.role === 'seller' ? 5.0 : 0);
    user.points_spent = user.points_spent !== undefined ? user.points_spent : 0;
    user.badges = user.badges || [];

    dbInstance.persist();
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Real SMS Sending helper via Twilio API
async function sendSmsOtp(toPhone: string, code: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log(`[SMS SERVICE] credentials not fully set. Simulated dispatch to masked target.`);
    return false;
  }

  // Normalize phone number to E.164 (e.g. 0609068246 -> +212609068246)
  let formattedPhone = toPhone.trim();
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '+212' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+' + formattedPhone;
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const messageBody = `منصة سوق الجملة: كود التحقق الإضافي الخاص بحساب المدير العام هو: ${code}. الرجاء عدم مشاركته إطلاقاً لحفظ خصوصية حسابك.`;

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: fromNumber,
        Body: messageBody
      })
    });

    if (res.ok) {
      console.log(`[SMS SERVICE] real SMS dispatched successfully via Twilio.`);
      return true;
    } else {
      const errText = await res.text();
      console.error(`[SMS SERVICE] Twilio return error.`);
      return false;
    }
  } catch (error) {
    console.error(`[SMS SERVICE] Failed to connect to SMS API.`);
    return false;
  }
}

// Send security OTP to phone 0609068246 specifically for General Manager authentication
app.post('/api/auth/send-security-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'معرف المستخدم غير ممتلئ' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود بالمنصة' });
    }

    const isGM = user.role === 'superadmin' || user.id === 'u-admin';
    if (!isGM) {
      return res.status(403).json({ error: 'عذراً، هذا الإجراء مخصص وخاص بصفحة المدير العام للمنصة للتأكيد الثنائي.' });
    }

    const code = generateOTP();
    securityOtps.set(userId, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000 // Valid for 10 minutes
    });

    // Unified robust core OTP service with SMS/Email dispatches
    await sendOTP(user, code, "CHANGE_PASSWORD", getClientIp(req));

    res.json({
      success: true,
      maskedPhone: '06******46',
      otpCodeSimulated: code
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Secure password change during authenticated profile session
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword, otpCode } = req.body;
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'عذراً، يرجى تقديم جميع بيانات كلمة المرور المطلوبة' });
    }

    const users = dbInstance.getUsers();
    const passwords = dbInstance.getPasswords();
    const passwordChanged = dbInstance.getPasswordChanged();

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود بالمنصة' });
    }

    // Checking if the user is General Manager (role === 'superadmin' or id === 'u-admin')
    const isGM = user.role === 'superadmin' || user.id === 'u-admin';
    if (isGM) {
      if (!otpCode) {
        return res.status(400).json({ error: 'يرجى إدخال رمز التحقق الثنائي (OTP) المرسل إلى رقم الهاتف الخاص بحماية حساب الإدارة.' });
      }
      try {
        await verifyOTP(userId, otpCode, "CHANGE_PASSWORD", getClientIp(req));
      } catch (verifyErr: any) {
        return res.status(400).json({ error: verifyErr.message });
      }
      // OTP validation succeeded!
      securityOtps.delete(userId);
    }

    // Safety limit checking: 3 times in 24 hours
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    let timestamps = user.passwordResetTimestamps || [];
    timestamps = timestamps.filter(t => new Date(t).getTime() > oneDayAgo);
    user.passwordResetTimestamps = timestamps;

    if (timestamps.length >= 3 && !isAdminRole(user.role)) {
      return res.status(400).json({ error: 'لقد تجاوزت الحد الأقصى لتغيير كلمة المرور. لا يمكنك تغيير كلمة المرور أكثر من 3 مرات خلال 24 ساعة.' });
    }

    // Validate strong password compatibility
    const passErr = validateStrongPassword(newPassword);
    if (passErr) {
      return res.status(400).json({ error: passErr });
    }

    // Match old password securely
    if (!comparePassword(user.id, oldPassword, passwords[user.id])) {
      return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    }

    // Securely hash new password
    passwords[userId] = hashPassword(newPassword);
    passwordChanged[userId] = true;

    // Track the password change
    timestamps.push(new Date().toISOString());
    user.passwordResetTimestamps = timestamps;
    user.passwordResetCount = (user.passwordResetCount || 0) + 1;

    dbInstance.persist();
    res.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cities and Categories
app.get('/api/cities', (req, res) => {
  res.json(dbInstance.getCities());
});

app.get('/api/categories', (req, res) => {
  res.json(dbInstance.getCategories());
});

app.post('/api/categories/reorder', (req, res) => {
  try {
    const { adminId, orderedIds } = req.body;
    if (!adminId || !orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'من فضلك أرسل معرف المسؤول ومصفوفة الترتيب الجديد.' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin' || u.role === 'moderator'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية إعادة ترتيب الأقسام.' });
    }

    const categories = dbInstance.getCategories();
    
    // update sortOrder based on position in orderedIds
    categories.forEach(c => {
      const idx = orderedIds.indexOf(c.id);
      if (idx !== -1) {
        c.sortOrder = idx * 10;
      } else {
        c.sortOrder = 9999;
      }
    });

    dbInstance.persist();

    // Log this action to admin audit logs
    dbInstance.getAuditLogs().push({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: 'إعادة ترتيب الأقسام',
      details: `قام المسؤول ${admin.name} بإعادة ترتيب أقسام المنتجات.`,
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      ip: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    });
    dbInstance.persist();

    res.json({ success: true, categories: dbInstance.getCategories() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories/reset', (req, res) => {
  try {
    const { adminId } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المسؤول مطلوب لإعادة تعيين الترتيب الافتراضي.' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin' || u.role === 'moderator'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية إعادة تعيين ترتيب الأقسام.' });
    }

    const defaultSeedIds = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6', 'cat7'];
    const categories = dbInstance.getCategories();
    
    categories.forEach(c => {
      const idx = defaultSeedIds.indexOf(c.id);
      if (idx !== -1) {
        c.sortOrder = idx * 10;
      } else {
        c.sortOrder = 9999;
      }
    });

    dbInstance.persist();

    // Log to admin audit logs
    dbInstance.getAuditLogs().push({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: 'إعادة تعيين ترتيب الأقسام للافتراضي',
      details: `قام المسؤول ${admin.name} بإعادة ضبط ترتيب أقسام المنتجات للوضع الافتراضي.`,
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      ip: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    });
    dbInstance.persist();

    res.json({ success: true, categories: dbInstance.getCategories() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cache for products list query results to boost performance
const productsCache = new Map<string, any>();

// Auto-clean the cache whenever a state mutation persist() is executed
const originalPersist = dbInstance.persist.bind(dbInstance);
dbInstance.persist = () => {
  productsCache.clear();
  originalPersist();
};

// SEO Dynamic Site Map
app.get("/sitemap.xml", (req, res) => {
  try {
    const products = dbInstance.getProducts().filter(p => p.status === 'active' || p.status === 'approved');
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}` || 'https://sou9aljoumla.com';
    
    // Core structural pathways
    const staticUrls = [
      '',
      '/about',
      '/contact'
    ].map(p => `  <url>\n    <loc>${baseUrl}${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`).join('\n');

    // Marketplace active product listings
    const productUrls = products.map(p => {
      const slug = p.slug || p.id;
      return `  <url>\n    <loc>${baseUrl}/product/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${productUrls}
</urlset>`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (err: any) {
    res.status(500).send("Error compiling XML Sitemap");
  }
});

// SEO Crawler Directives
app.get("/robots.txt", (req, res) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}` || 'https://sou9aljoumla.com';
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

Sitemap: ${baseUrl}/sitemap.xml`);
});

// Products Listing, creation and detail operations
app.get('/api/products', (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    if (productsCache.has(cacheKey)) {
      return res.json(productsCache.get(cacheKey));
    }

    // Run the automatic check and cleanup for expired Premium ads first
    checkAndCleanExpiredPremiums();

    const { q, category, city, sortBy, filterFeatured, sellerId, viewerId } = req.query;
    const usersList = dbInstance.getUsers();
    let list = [...dbInstance.getProducts()].filter(p => {
      // Owner security exception: A seller can view their pending_review or rejected items in their own portfolio, but others can't.
      const isOwner = sellerId && String(sellerId) === p.sellerId && viewerId && String(viewerId) === p.sellerId;
      const isApproved = p.status === 'active' || p.status === 'approved';
      
      if (!isApproved && !isOwner) {
        return false;
      }
      
      if (sellerId && p.sellerId !== String(sellerId)) {
        return false;
      }
      
      const seller = usersList.find(u => u.id === p.sellerId);
      if (seller && (seller.role === 'superadmin' || seller.id === 'u-admin')) {
        return false;
      }
      return true;
    });

    // Query Search (case insensitive)
    if (q) {
      const qStr = String(q).toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(qStr) || 
        p.description.toLowerCase().includes(qStr) ||
        (p.titleFr && p.titleFr.toLowerCase().includes(qStr)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(qStr)) ||
        p.tags.some(t => t.toLowerCase().includes(qStr))
      );
    }

    // Category Filter
    if (category) {
      list = list.filter(p => p.category === category);
    }

    // City Filter
    if (city) {
      list = list.filter(p => p.location.toLowerCase() === String(city).toLowerCase());
    }

    // Featured Filter
    if (filterFeatured === 'true') {
      list = list.filter(p => p.isFeatured || p.is_premium || p.isPinned);
    }

    // Sorting block: Premium (isFeatured or is_premium) listed FIRST, then Normal ads SECOND.
    // Within Premium ads: sorted descending by last activation premium_created_at (fallbacks to createdAt).
    // Within Normal ads: sorted by selected sortBy criteria, or descending by createdAt by default.
    const getPremiumTime = (p: any): number => {
      const d = p.premium_created_at || p.createdAt;
      return d ? new Date(d).getTime() : 0;
    };

    const getCreatedTime = (p: any): number => {
      return p.createdAt ? new Date(p.createdAt).getTime() : 0;
    };

    // Split the filtered list into pinned, premium/featured, and regular ads
    const pinnedAds = list.filter(p => p.isPinned);
    const unpinnedPremium = list.filter(p => !p.isPinned && (p.isFeatured || p.is_premium));
    const normalAds = list.filter(p => !p.isPinned && !p.isFeatured && !p.is_premium);

    // 1. Sort the Premium ads descending by activation date (newest premium_created_at first)
    unpinnedPremium.sort((a, b) => getPremiumTime(b) - getPremiumTime(a));

    // Also sort pinned list elegantly placing premium pinned on top
    pinnedAds.sort((a, b) => {
      const aPremium = a.isFeatured || a.is_premium;
      const bPremium = b.isFeatured || b.is_premium;
      if (aPremium && !bPremium) return -1;
      if (!aPremium && bPremium) return 1;
      return getPremiumTime(b) - getPremiumTime(a);
    });

    // 2. Sort Normal ads depending on selected sortBy value
    if (sortBy === 'price_asc') {
      normalAds.sort((a, b) => a.priceMin - b.priceMin);
    } else if (sortBy === 'price_desc') {
      normalAds.sort((a, b) => b.priceMin - a.priceMin);
    } else if (sortBy === 'views') {
      normalAds.sort((a, b) => b.views - a.views);
    } else {
      // Default: newest first
      normalAds.sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
    }

    // Merge: Pinned ads on top, then active premium, then normal ads
    list = [...pinnedAds, ...unpinnedPremium, ...normalAds];

    const enrichedList = list.map(p => {
      const seller = usersList.find(u => u.id === p.sellerId);
      return {
        ...p,
        sellerVerified: seller ? seller.isVerified : p.sellerVerified,
        sellerName: seller ? (seller.companyName || seller.name) : p.sellerName,
        sellerBadges: seller ? (seller.badges || []) : []
      };
    });

    productsCache.set(cacheKey, enrichedList);
    res.json(enrichedList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Single Product Details + View Counter Addition
app.get('/api/products/:id', (req, res) => {
  try {
    // Check and update expired premium status before retrieval
    checkAndCleanExpiredPremiums();

    const { id: paramId } = req.params;
    const products = dbInstance.getProducts();
    const item = products.find(p => p.id === paramId || p.slug === paramId);

    if (!item) {
      return res.status(404).json({ error: 'المنتج المطلوب غير متوفر' });
    }

    const id = item.id;
    
    // Server-side robust unique tracking to prevent double views/fake reloads
    const ipStr = getClientIp(req);
    const userIdVal = (req.query.userId || req.body.userId || 'guest') as string;
    const trackingKey = `${ipStr}-${userIdVal}`;

    if (!productVisitsCache.has(id)) {
      productVisitsCache.set(id, new Map<string, number>());
    }
    const productCache = productVisitsCache.get(id)!;
    const nowTime = Date.now();
    const lastVisit = productCache.get(trackingKey) || 0;

    if (nowTime - lastVisit > 86400000) { // Strictly 24 hours barrier to prevent refresh spamming
      item.views = (item.views || 0) + 1;
      productCache.set(trackingKey, nowTime);
      saveVisitsCache();
      dbInstance.persist();
    }

    // Get ratings, media, seller replies & comments
    const reviews = dbInstance.getReviews()
      .filter(r => r.productId === id)
      .map(r => {
        const media = dbInstance.getReviewMedia().filter(m => m.review_id === r.id);
        return {
          ...r,
          media
        };
      });

    const comments = dbInstance.getComments().filter(c => c.productId === id);
    const seller = dbInstance.getUsers().find(u => u.id === item.sellerId);
    const isGMSeller = seller && (seller.role === 'superadmin' || seller.id === 'u-admin');

    // Get product questions & answers
    const questions = dbInstance.getReviewQuestions()
      .filter(q => q.product_id === id)
      .map(q => {
        const answers = dbInstance.getReviewAnswers().filter(a => a.question_id === q.id);
        return {
          ...q,
          answers
        };
      });

    res.json({
      product: item,
      reviews,
      questions,
      comments,
      seller: (seller && !isGMSeller) ? {
        id: seller.id,
        name: seller.name,
        companyName: seller.companyName,
        companyLogo: seller.companyLogo,
        companyDesc: seller.companyDesc,
        companyBanner: seller.companyBanner,
        phone: seller.phone,
        whatsapp: seller.whatsapp,
        city: seller.city,
        isVerified: seller.isVerified,
        createdAt: seller.createdAt,
        verifiedBadge: seller.isVerified,
        profile_image: seller.profile_image,
        sales_count: seller.sales_count,
        rating: seller.rating,
        badges: seller.badges
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Record real conversion contact lead (Securely tracked and logged)
app.post('/api/products/:id/record-contact', (req, res) => {
  try {
    const { id } = req.params;
    const products = dbInstance.getProducts();
    const prod = products.find(p => p.id === id);
    if (!prod) {
      return res.status(404).json({ error: 'المنتج غير موجود ببيانات المتجر' });
    }

    // Unique view tracking with client IP / User on contact click as well
    const ipStr = getClientIp(req);
    const userIdVal = (req.query.userId || req.body.userId || 'guest') as string;
    const trackingKey = `${ipStr}-${userIdVal}`;

    if (!productVisitsCache.has(id)) {
      productVisitsCache.set(id, new Map<string, number>());
    }
    const productCache = productVisitsCache.get(id)!;
    const nowTime = Date.now();
    const lastVisit = productCache.get(trackingKey) || 0;

    if (nowTime - lastVisit > 86400000) { // Strictly 24 hours barrier to prevent refresh spamming
      prod.views = (prod.views || 0) + 1;
      productCache.set(trackingKey, nowTime);
      saveVisitsCache();
    }

    const users = dbInstance.getUsers();
    const seller = users.find(u => u.id === prod.sellerId);

    // Persist and return current stats cleanly (with NO automatic fake sales elevation)
    dbInstance.persist();
    res.json({
      success: true,
      sales_count: seller ? (seller.sales_count || 0) : 0,
      views: prod.views
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profile/stats/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const users = dbInstance.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'المستند غير متوفر أو المستخدم المحدد غير موجود' });
    }

    const stats = dbInstance.getProfileStats();
    let stat = stats.find(ps => ps.user_id === userId);
    if (!stat) {
      stat = {
        user_id: userId,
        views_count: userId === 'u-seller1' ? 97 : (user.role === 'seller' ? 15 : 0),
        sales_count: user.sales_count !== undefined ? user.sales_count : (userId === 'u-seller1' ? 142 : 0),
        updated_at: new Date().toISOString()
      };
      stats.push(stat);
      dbInstance.persist();
    }

    res.json({
      views: stat.views_count,
      sales: stat.sales_count,
      createdAt: user.created_at || user.createdAt
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Profile In-memory Visit Session Cache for unique visits duplicate rate limitation (5 minutes)
const profileVisitsCache: Record<string, Record<string, number>> = {};

app.post('/api/profile/view/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const users = dbInstance.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'المستند غير متوفر أو المستخدم المحدد غير موجود' });
    }

    const stats = dbInstance.getProfileStats();
    let stat = stats.find(ps => ps.user_id === userId);
    if (!stat) {
      stat = {
        user_id: userId,
        views_count: userId === 'u-seller1' ? 97 : (user.role === 'seller' ? 15 : 0),
        sales_count: user.sales_count !== undefined ? user.sales_count : (userId === 'u-seller1' ? 142 : 0),
        updated_at: new Date().toISOString()
      };
      stats.push(stat);
    }

    // Rate limiting / duplicate visitor prevention using IP or session string
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const ipStr = Array.isArray(clientIp) ? clientIp[0] : clientIp;

    if (!profileVisitsCache[userId]) {
      profileVisitsCache[userId] = {};
    }

    const now = Date.now();
    const lastVisit = profileVisitsCache[userId][ipStr] || 0;
    // 5 minutes time barrier (300000ms)
    if (now - lastVisit > 300000) {
      stat.views_count = (stat.views_count || 0) + 1;
      stat.updated_at = new Date().toISOString();
      profileVisitsCache[userId][ipStr] = now;
      dbInstance.persist();
    }

    res.json({
      views: stat.views_count,
      sales: stat.sales_count,
      createdAt: user.created_at || user.createdAt
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- AMAZON-LIKE PRODUCT APPROVAL PIPELINE (ENTERPRISE SYSTEM) ---
export interface ModerationQueueItem {
  id: string;
  productId: string;
  productTitle: string;
  sellerId: string;
  sellerName: string;
  riskScore: number;
  riskReasons: string[];
  status: 'queued' | 'processing' | 'blocked' | 'human_review' | 'escalated' | 'changes_requested' | 'approved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  processedAt?: string;
}

export interface NotificationQueueItem {
  id: string;
  userId: string;
  text: string;
  type: 'info' | 'success' | 'danger';
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  createdAt: string;
  sentAt?: string;
}

export const sellerSpamTracker: Record<string, number[]> = {};

export function checkProductRisk(productTitle: string, description: string, priceMin: number, priceMax: number, sellerId: string): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Check seller age
  const users = dbInstance.getUsers();
  const seller = users.find(u => u.id === sellerId);
  if (seller) {
    const createdDate = new Date(seller.createdAt || seller.created_at || new Date()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    if (Date.now() - createdDate < oneDay) {
      score += 20;
      reasons.push('حساب بائع جديد تم إنشاؤه مؤخراً');
    }
  } else {
    score += 20;
    reasons.push('حساب بائع غير معروف أو محذوف');
  }

  // 2. High price anomaly or extreme outliers
  if (priceMax > 150000 || priceMin <= 1) {
    score += 15;
    reasons.push('شذوذ ملحوظ في نطاق تسعير الجملة المقترح');
  }

  // 3. Blacklist banned promotional & hacking keywords & contact detail masking (Anti-Fraud checks)
  const textToAnalyze = (productTitle + ' ' + description).toLowerCase();
  
  const bannedKeywords = [
    'واتساب', 'هاتف', 'اتصال', 'تواصل معي', 'رقمي', 'سكس', 'متابعين', 'لايكات',
    'whatsapp', 'phone', 'call', 'contact me', 'follow', 'subscribers', 'telegram', 'http', 'www.'
  ];

  const matchedWords = bannedKeywords.filter(word => textToAnalyze.includes(word));
  if (matchedWords.length > 0) {
    score += 25;
    reasons.push(`رصد مصطلحات ترويجية أو روابط خارجية غير مصرح بها: ${matchedWords.join(', ')}`);
  }

  // 4. Duplicate listing checking
  const existingProducts = dbInstance.getProducts();
  const cleanCurrentTitle = productTitle.trim().toLowerCase();
  const isDuplicate = existingProducts.some(p => p.sellerId === sellerId && p.title.trim().toLowerCase() === cleanCurrentTitle);
  if (isDuplicate) {
    score += 40;
    reasons.push('اشتباه تكرار مفرط لإعلان تجاري متطابق');
  }

  // 5. Anti-Abuse Rapid Posting Detection (Level 2 Rate-limiting)
  const postTimes = sellerSpamTracker[sellerId] || [];
  const now = Date.now();
  const recentPosts = postTimes.filter(t => now - t < 5 * 60 * 1000); // 5 minutes window
  if (recentPosts.length >= 2) {
    score += 30;
    reasons.push('معدل تكرار إغراق فائق السرعة لقائمة المنتجات');
  }

  return { score, reasons };
}

export function pushNotificationQueue(userId: string, text: string, type: 'info' | 'success' | 'danger' = 'info') {
  const notifyItem: NotificationQueueItem = {
    id: 'nq-' + crypto.randomUUID(),
    userId,
    text,
    type,
    status: 'pending',
    attempts: 0,
    createdAt: new Date().toISOString()
  };

  dbInstance.getNotificationQueue().push(notifyItem);
  processNotificationQueue();
}

export function processNotificationQueue() {
  const queue = dbInstance.getNotificationQueue();
  const users = dbInstance.getUsers();

  queue.forEach(item => {
    if (item.status === 'pending' || item.status === 'failed') {
      item.attempts += 1;
      const user = users.find(u => u.id === item.userId);
      if (user) {
        if (!user.notifications) user.notifications = [];
        user.notifications.unshift({
          id: 'nt-' + crypto.randomUUID(),
          text: item.text,
          createdAt: new Date().toISOString(),
          isRead: false,
          type: item.type
        });
        item.status = 'sent';
        item.sentAt = new Date().toISOString();
      } else {
        item.status = item.attempts >= 3 ? 'failed' : 'pending';
      }
    }
  });

  dbInstance.persist();
}

export function emitProductCreatedEvent(productId: string) {
  const products = dbInstance.getProducts();
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  // Track the creation time in anti-abuse monitor
  if (!sellerSpamTracker[prod.sellerId]) {
    sellerSpamTracker[prod.sellerId] = [];
  }
  sellerSpamTracker[prod.sellerId].push(Date.now());

  // Trigger anti-fraud pipeline dynamic checks
  const check = checkProductRisk(prod.title, prod.description, prod.priceMin, prod.priceMax, prod.sellerId);
  prod.riskScore = check.score;
  prod.riskReasons = check.reasons;

  let decisionStatus: 'queued' | 'processing' | 'blocked' | 'human_review' | 'approved' = 'queued';
  let priorityOrder: 'low' | 'medium' | 'high' = 'low';

  if (check.score >= 70) {
    decisionStatus = 'blocked';
    prod.status = 'rejected';
    prod.rejectionReason = `تم الحجب الفوري تلقائياً بالذكاء الوقائي لنظام الجرد. الأسباب: ${check.reasons.join('، ')}`;
    priorityOrder = 'high';
  } else if (check.score >= 30) {
    decisionStatus = 'human_review';
    prod.status = 'pending_review';
    priorityOrder = 'medium';
  } else {
    decisionStatus = 'approved';
    prod.status = 'approved'; // Auto-Approved instantly
  }

  prod.moderationStatus = decisionStatus === 'approved' ? undefined : (decisionStatus as any);

  // Generate unique publication event token (Idempotency shield)
  prod.publisherEventId = 'pub-evt-' + crypto.randomUUID();

  // Write moderation queue metadata
  const queueElement: ModerationQueueItem = {
    id: 'mq-' + crypto.randomUUID(),
    productId: prod.id,
    productTitle: prod.title,
    sellerId: prod.sellerId,
    sellerName: prod.sellerName || 'تاجر مسجل',
    riskScore: check.score,
    riskReasons: check.reasons,
    status: decisionStatus,
    priority: priorityOrder,
    createdAt: new Date().toISOString()
  };

  dbInstance.getModerationQueue().push(queueElement);

  // Send reliable notification queue items
  let text = `مستلم: المنتج "${prod.title}" قيد المعالجة. `;
  let nType: 'info' | 'success' | 'danger' = 'info';

  if (decisionStatus === 'blocked') {
    text += `تم حظر الإعلان تلقائياً للأمان الوقائي لتفادي الاحتيال المتكرر. الأسباب: ${check.reasons.join(', ')}`;
    nType = 'danger';
  } else if (decisionStatus === 'approved') {
    text += `تم التحقق آلياً بنجاح وتم تنشيط عرض الجملة المباشر دون انتظار!`;
    nType = 'success';
  } else {
    text += `يتطلب مراجعة تدقيق متقدمة من مشرفي لوحة التحكم وسيتم البت فيه سريعاً للسلامة الأمنية.`;
  }

  pushNotificationQueue(prod.sellerId, text, nType);
  dbInstance.persist();
}

// Product Submission with points charging
app.post('/api/products/create', (req, res) => {
  try {
    const { 
      sellerId, title, titleFr, description, descriptionFr, shortDescription, 
      category, subcategory, brand, condition, priceMin, priceMax, 
      moq, maxOrder, stock, sku, images, videoUrl, pdfUrl, tags, location, isFeatured,
      shipping_type, shipping_cost
    } = req.body;

    // Enforce IDOR protection on product creation
    const sessionUser = req.sessionUser;
    if (!sessionUser) {
      return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول للقيام بالعملية.' });
    }
    if (sessionUser.role !== 'superadmin' && sessionUser.role !== 'admin' && sessionUser.userId !== sellerId) {
      return res.status(403).json({ error: 'عذراً، غير مصرح لك بإنشاء منتجات باسم حساب آخر (حماية IDOR).' });
    }

    if (!sellerId || !title || !description || !category || !subcategory || !priceMin || !priceMax || !moq) {
      return res.status(400).json({ error: 'يرجى إدخال جميع الحقول الإلزامية للمنتج' });
    }

    if (Number(moq) < 10) {
      return res.status(400).json({ error: 'عذراً، يجب أن يكون الحد الأدنى للطلب (MOQ) 10 حبات أو أكثر.' });
    }

    // Shipping info validation
    let finalShippingType: 'free' | 'paid' = shipping_type === 'paid' ? 'paid' : 'free';
    let finalShippingCost = 0;
    if (finalShippingType === 'paid') {
      const parsedCost = Number(shipping_cost);
      if (shipping_cost === undefined || shipping_cost === null || shipping_cost === '' || isNaN(parsedCost)) {
        return res.status(400).json({ error: 'يرجى إدخال سعر الشحن بما أنك اخترت شحناً مدفوعاً' });
      }
      if (parsedCost < 0) {
        return res.status(400).json({ error: 'سعر الشحن لا يمكن أن يكون سالباً' });
      }
      finalShippingCost = parsedCost;
    }

    const users = dbInstance.getUsers();
    const seller = users.find(u => u.id === sellerId);

    if (!seller) {
      return res.status(404).json({ error: 'عذراً، البائع غير موجود' });
    }

    if (seller.status === 'suspended') {
      return res.status(403).json({ error: 'عذراً، هذا الحساب موقوف أو محظور ولا يمكنه النشر حالياً.' });
    }

    // Points calculation:
    // Dynamic normal publishing cost, Featured: 60 points
    // Extra photos: first 4 are free. Photo 5 to 9 cost 5 points each. Maximum is 9 photos total.
    let listImages = Array.isArray(images) ? images : [];
    if (listImages.length > 9) {
      return res.status(400).json({ error: 'عذراً لا يسمح برفع أكثر من 9 صور في الإعلان الواحد.' });
    }

    const settings = dbInstance.getSettings();
    const dynamicCost = settings.publishingCost !== undefined ? Number(settings.publishingCost) : 20;
    const paidPublishingEnabled = settings.paidPublishingEnabled !== undefined ? !!settings.paidPublishingEnabled : true;

    let requiredPoints = 0;
    if (paidPublishingEnabled) {
      requiredPoints = isFeatured ? 60 : dynamicCost;
      if (listImages.length > 4) {
        const extraCount = listImages.length - 4;
        requiredPoints += (extraCount * 5);
      }
    }

    if (requiredPoints > 0 && seller.points < requiredPoints) {
      return res.status(402).json({ 
        error: `رصيد النقاط لديك غير كافٍ. تحتاج إلى ${requiredPoints} نقطة، رصيدك الحالي: ${seller.points} نقطة. يرجى شحن محفظتك للمواصلة.`,
        requiredPoints,
        currentPoints: seller.points
      });
    }

    // Deduct points from seller
    if (requiredPoints > 0) {
      seller.points -= requiredPoints;
    }

    // Create product
    const pId = 'p-' + Math.random().toString(36).substr(2, 9);
    const slug = title.toLowerCase()
      .replace(/[^\u0600-\u06FFa-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 4);

    const newProduct: Product = {
      id: pId,
      title,
      titleFr: titleFr || title,
      description,
      descriptionFr: descriptionFr || description,
      shortDescription: shortDescription || '',
      shortDescriptionFr: shortDescription || '',
      category,
      subcategory,
      brand: brand || 'Generic',
      condition: condition || 'new',
      priceMin: Number(priceMin),
      priceMax: Number(priceMax),
      unitPrice: Number(priceMax),
      bulkPrice: Number(priceMin),
      currency: 'MAD',
      moq: Number(moq),
      maxOrder: Number(maxOrder || 10000),
      stock: Number(stock || 100),
      sku: sku || ('SKU-' + Math.random().toString(36).substr(2, 6).toUpperCase()),
      images: listImages.length > 0 ? listImages : ['https://images.unsplash.com/photo-1546213290-e1b7610339ef?auto=format&fit=crop&q=80&w=600'],
      videoUrl: videoUrl || '',
      pdfUrl: pdfUrl || '',
      tags: Array.isArray(tags) ? tags : [],
      location: location || seller.city,
      sellerId: seller.id,
      createdAt: new Date().toISOString(),
      views: 0,
      status: 'pending_review', // direct approval by default or admin review configurable
      isFeatured: !!isFeatured,
      is_premium: !!isFeatured,
      premium_created_at: isFeatured ? new Date().toISOString() : undefined,
      isPinned: false,
      slug,
      sellerName: seller.name,
      sellerVerified: seller.isVerified,
      sellerCity: seller.city,
      sellerRating: 5.0,
      shipping_type: finalShippingType,
      shipping_cost: finalShippingCost
    };

    dbInstance.getProducts().push(newProduct);

    // Trigger Amazon-like advanced Moderation Event-Driven Pipeline
    emitProductCreatedEvent(newProduct.id);

    // Create transaction log
    dbInstance.getWalletTransactions().push({
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      userId: seller.id,
      type: 'debit',
      amount: 0,
      points: requiredPoints,
      description: `نشر منتج: ${title} (${isFeatured ? 'مميز' : 'عادي'}) - دخل خط التحقق التلقائي واليدوي`,
      createdAt: new Date().toISOString(),
      status: 'completed'
    });

    dbInstance.persist();
    res.json({ success: true, product: newProduct, currentPoints: seller.points });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Orders Management Backend APIs
app.post('/api/orders/create', (req, res) => {
  try {
    const { productId, buyerId, buyerName, buyerPhone, shippingAddress, quantity, couponCode } = req.body;
    if (!productId || !buyerId || !buyerName || !buyerPhone || !shippingAddress || !quantity) {
      return res.status(400).json({ error: 'من فضلك أكمل جميع بيانات الشحن والطلب الأساسية.' });
    }

    const user = dbInstance.getUsers().find(u => u.id === buyerId);
    if (!user) {
      return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول باستخدام حساب صحيح لتقديم طلب الشراء.' });
    }

    const nameErr = validateFullName(buyerName);
    if (nameErr) return res.status(400).json({ error: nameErr });

    const phoneErr = validatePhoneNumber(buyerPhone);
    if (phoneErr) return res.status(400).json({ error: phoneErr });

    const addressErr = validateAddress(shippingAddress);
    if (addressErr) return res.status(400).json({ error: addressErr });

    const product = dbInstance.getProducts().find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'عذراً، المنتج غير متوفر حالياً.' });
    }

    const qty = Number(quantity);
    const minQtyAllowed = Math.max(10, product.moq || 0);
    if (isNaN(qty) || qty < minQtyAllowed) {
      return res.status(400).json({ error: `الكمية المدخلة غير صحيحة، الحد الأدنى للطلب هو ${minQtyAllowed} قطع.` });
    }

    const unitPrice = product.unitPrice || product.priceMax || 0;
    const shippingType = product.shipping_type || 'free';
    const shippingCost = shippingType === 'paid' ? (product.shipping_cost || 0) : 0;
    const totalProductPrice = unitPrice * qty;

    // Handle Coupons / Discounts securely
    let discountApplied = 0;
    let appliedCouponObj: any = null;
    if (couponCode) {
      const codeClean = String(couponCode).trim().toUpperCase();
      const coupons = dbInstance.getCoupons();
      const coupon = coupons.find(c => c.code.toUpperCase() === codeClean);
      if (!coupon) {
        return res.status(400).json({ error: 'رمز كوبون الخصم المدخل غير موجود بمروحة المنصة.' });
      }
      if (coupon.status !== 'active') {
        return res.status(400).json({ error: 'عذراً، كود الخصم هذا معطل أو تم إيقافه.' });
      }
      if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
        return res.status(400).json({ error: 'عذراً، انتهت مدة صلاحية رمز الخصم هذا.' });
      }
      if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
        return res.status(400).json({ error: 'عذراً، انتهى الحد الأقصى لاستخدام هذا الكوبون.' });
      }
      if (coupon.minPurchase && totalProductPrice < coupon.minPurchase) {
        return res.status(400).json({ error: `عذراً، يجب أن تبدأ القيمة الإجمالية للمنتجات من ${coupon.minPurchase} MAD لتطبيق هذا الخصم.` });
      }

      // Apply math deduction securely on server
      if (coupon.type === 'percentage') {
        discountApplied = totalProductPrice * (coupon.value / 100);
        if (coupon.maxDiscount && discountApplied > coupon.maxDiscount) {
          discountApplied = coupon.maxDiscount;
        }
      } else if (coupon.type === 'fixed') {
        discountApplied = coupon.value;
      }

      discountApplied = Math.min(discountApplied, totalProductPrice);
      coupon.usageCount = (coupon.usageCount || 0) + 1;
      appliedCouponObj = coupon;
    }

    const totalPrice = Math.max(0, totalProductPrice - discountApplied + shippingCost);

    const newOrder: Order = {
      id: 'ord-' + Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0] || '',
      sellerId: product.sellerId,
      buyerId,
      buyerName,
      buyerPhone,
      shippingAddress,
      quantity: qty,
      unitPrice,
      shippingType,
      shippingCost,
      totalPrice,
      couponCode: appliedCouponObj ? appliedCouponObj.code : undefined,
      discountApplied: discountApplied > 0 ? discountApplied : undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    dbInstance.getOrders().push(newOrder);

    // Dynamic Instant Notification Setup via Chat Messenger
    const rooms = dbInstance.getChatRooms();
    let room = rooms.find(r => r.buyerId === buyerId && r.sellerId === product.sellerId);
    if (!room) {
      const users = dbInstance.getUsers();
      const buyer = users.find(u => u.id === buyerId);
      const seller = users.find(u => u.id === product.sellerId);
      room = {
        id: 'room-' + Math.random().toString(35).substr(2, 9),
        buyerId,
        sellerId: product.sellerId,
        buyerName: buyer?.name || buyerName,
        sellerName: seller?.companyName || seller?.name || 'مورد الجملة',
        buyerLogo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        sellerLogo: seller?.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200',
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCountBuyer: 0,
        unreadCountSeller: 0
      };
      rooms.push(room);
    }

    const notificationText = `🛒 [طلب شراء جديد مرجع رقم ${newOrder.id}]: لقد قام المشتري بتقديم طلب شراء للمنتج "${newOrder.productTitle}" بكمية ${qty} قطعة. القيمة الإجمالية: ${totalPrice.toLocaleString()} MAD.${discountApplied > 0 ? ` (تم تطبيق كود الخصم: ${appliedCouponObj.code} وخفض ${discountApplied.toLocaleString()} MAD)` : ''} يرجى من المورد مراجعة الطلب وتأكيد الموافقة لبدء الشحن والتوصيل.`;
    
    const automaticMsg = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      roomId: room.id,
      senderId: buyerId,
      text: notificationText,
      imageUrl: '',
      status: 'sent' as const,
      createdAt: new Date().toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);

    room.lastMessage = notificationText;
    room.lastMessageTime = automaticMsg.createdAt;
    room.unreadCountSeller += 1;

    dbInstance.persist();

    res.json({ success: true, order: newOrder });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'مطلوب معرف المستخدم.' });
    }

    // Enforce IDOR protection (OWASP)
    const sessionUser = req.sessionUser;
    if (!sessionUser) {
      return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول لرؤية الطلبات.' });
    }
    if (sessionUser.role !== 'superadmin' && sessionUser.role !== 'admin' && sessionUser.userId !== String(userId)) {
      return res.status(403).json({ error: 'عذراً، لا تملك الصلاحية لاستعراض طلبات مستخدم آخر (حماية IDOR).' });
    }

    const allOrders = dbInstance.getOrders();
    const filteredOrders = allOrders.filter(o => o.buyerId === userId || o.sellerId === userId);
    res.json({ success: true, orders: filteredOrders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders/:orderId/approve', authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId } = req.body;
    if (!userId || !roomId) {
      return res.status(400).json({ error: 'مطلوب تحديد معرف المستخدم والدردشة.' });
    }

    const order = dbInstance.getOrders().find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود.' });
    }

    if (order.sellerId !== userId) {
      return res.status(403).json({ error: 'عذراً، لا تمتلك الصلاحية للموافقة على هذا الطلب.' });
    }

    order.status = 'approved';

    const msgText = `📢 [تحديث الطلب رقم ${orderId}]: تمت الموافقة على طلبكم للمنتج "${order.productTitle}" وهو الآن قيد المراجعة والتحضير والتجهيز للشحن.`;

    const automaticMsg = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: userId,
      text: msgText,
      imageUrl: '',
      status: 'sent' as const,
      createdAt: new Date().toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);

    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = msgText;
      rooms[rIdx].lastMessageTime = automaticMsg.createdAt;
      rooms[rIdx].unreadCountBuyer += 1;
    }

    dbInstance.getAuditLogs().push({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: 'الموافقة على الطلب',
      details: `قام التاجر ذو المعرف ${userId} بالموافقة على الطلب رقم ${orderId} للمنتج "${order.productTitle}" وبدء تحضيره للشحن للمشتري ذو المعرف ${order.buyerId}.`,
      adminId: userId,
      adminName: order.buyerName,
      adminEmail: 'seller@sou9aljoumla.com',
      ip: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, order });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders/:orderId/ship', authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId } = req.body;
    if (!userId || !roomId) {
      return res.status(400).json({ error: 'مطلوب تحديد معرف المستخدم والدردشة.' });
    }

    const order = dbInstance.getOrders().find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود.' });
    }

    if (order.sellerId !== userId) {
      return res.status(403).json({ error: 'عذراً، لا تمتلك الصلاحية لشحن هذا الطلب.' });
    }

    order.status = 'shipped';

    const msgText = `🚚 [تحديث الشحن رقم ${orderId}]: لقد تم شحن طلبكم بنجاح! الشحنة الآن في طريقها إليكم وتستغرق عادة من ۲٤ إلى ٤٨ ساعة للتسليم. شكراً لثقتكم.`;

    const automaticMsg = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: userId,
      text: msgText,
      imageUrl: '',
      status: 'sent' as const,
      createdAt: new Date().toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);

    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = msgText;
      rooms[rIdx].lastMessageTime = automaticMsg.createdAt;
      rooms[rIdx].unreadCountBuyer += 1;
    }

    dbInstance.getAuditLogs().push({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: 'شحن الطلب والمنتجات',
      details: `قام التاجر ذو المعرف ${userId} بتأكيد شحن الطلب رقم ${orderId} بنجاح، وتغيير حالة الطلب إلى "مشحون" لصالِح المشترِي ${order.buyerName}.`,
      adminId: userId,
      adminName: order.buyerName,
      adminEmail: 'seller@sou9aljoumla.com',
      ip: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, order });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders/:orderId/complete', authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId } = req.body;
    if (!userId || !roomId) {
      return res.status(400).json({ error: 'مطلوب تحديد معرف المستخدم والدردشة.' });
    }

    const order = dbInstance.getOrders().find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود.' });
    }

    if (order.sellerId !== userId) {
      return res.status(403).json({ error: 'عذراً، لا تمتلك الصلاحية لتغيير حالة هذا الطلب.' });
    }

    order.status = 'completed';

    // Increment seller's absolute true verified sales count and update profile stats inside DB
    try {
      const seller = dbInstance.getUsers().find(u => u.id === order.sellerId);
      if (seller) {
        seller.sales_count = (seller.sales_count || 0) + 1;

        const stats = dbInstance.getProfileStats();
        let stat = stats.find(ps => ps.user_id === order.sellerId);
        if (!stat) {
          stat = {
            user_id: order.sellerId,
            views_count: 0,
            sales_count: seller.sales_count,
            updated_at: new Date().toISOString()
          };
          stats.push(stat);
        } else {
          stat.sales_count = seller.sales_count;
          stat.updated_at = new Date().toISOString();
        }
      }
    } catch (salesCountErr) {
      console.error('Error incrementing seller verified sales count:', salesCountErr);
    }

    // Automatic Seller Badge Upgrade (from 'New Seller' to 'Verified Seller')
    try {
      const seller = dbInstance.getUsers().find(u => u.id === order.sellerId);
      if (seller && seller.role === 'seller') {
        seller.badges = seller.badges || [];
        if (seller.badges.includes('New Seller')) {
          // Remove 'New Seller' and add 'Verified Seller'
          seller.badges = seller.badges.filter(b => b !== 'New Seller');
          if (!seller.badges.includes('Verified Seller')) {
            seller.badges.push('Verified Seller');
          }
          
          // Log the automatic promotion
          dbInstance.getAuditLogs().push({
            id: 'log-' + Math.random().toString(36).substr(2, 9),
            action: 'ترقية تلقائية لشارة البائع',
            details: `تمت ترقية البائع ${seller.name} تلقائياً من شارة "بائع جديد" إلى شارة "مورد موثوق" بعد إتمام أول عملية تسليم ناجحة للطلب رقم ${orderId}.`,
            adminId: seller.id,
            adminName: seller.name,
            adminEmail: 'system@sou9aljoumla.com',
            ip: req.ip || '127.0.0.1',
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (badgeErr) {
      console.error('Error upgrading seller badge:', badgeErr);
    }

    const msgText = `✅ [تحديث الطلب رقم ${orderId}]: تم التسليم واستلام المبلغ بنجاح! تم وضع علامة "مكتمل والتسليم بنجاح" على معاملتكم. شكراً جزيلاً لتعاملكم معنا.`;

    const automaticMsg = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: userId,
      text: msgText,
      imageUrl: '',
      status: 'sent' as const,
      createdAt: new Date().toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);

    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = msgText;
      rooms[rIdx].lastMessageTime = automaticMsg.createdAt;
      rooms[rIdx].unreadCountBuyer += 1;
    }

    dbInstance.getAuditLogs().push({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: 'تسليم الطلب بالكامل',
      details: `قام التاجر ذو المعرف ${userId} بتأكيد تسليم الطلب رقم ${orderId} بنجاح للزبون واستلام ثمن البضاعة كاملة وتصنيف الطلب كـ "مكتمل".`,
      adminId: userId,
      adminName: order.buyerName,
      adminEmail: 'seller@sou9aljoumla.com',
      ip: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, order });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders/:orderId/cancel', authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId } = req.body;
    if (!userId || !roomId) {
      return res.status(400).json({ error: 'مطلوب تحديد معرف المستخدم والدردشة.' });
    }

    const order = dbInstance.getOrders().find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود.' });
    }

    // Both seller and buyer can cancel/reject order if it is not completed yet
    if (order.sellerId !== userId && order.buyerId !== userId) {
      return res.status(403).json({ error: 'عذراً، لا تمتلك الصلاحية لإلغاء هذا الطلب.' });
    }

    if (order.status === 'completed') {
      return res.status(400).json({ error: 'عذراً، لا يمكن إلغاء طلب تم تسليمه واستلام مبلغه بالفعل.' });
    }

    order.status = 'cancelled';

    const isSeller = (order.sellerId === userId);
    const msgText = isSeller 
      ? `❌ [تحديث الطلب رقم ${orderId}]: نعتذر منك، لقد قام المورد برفض/إلغاء هذا الطلب.`
      : `❌ [تحديث الطلب رقم ${orderId}]: نعتذر، لقد قام المشتري بإلغاء هذا الطلب.`;

    const automaticMsg = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: userId,
      text: msgText,
      imageUrl: '',
      status: 'sent' as const,
      createdAt: new Date().toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);

    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = msgText;
      rooms[rIdx].lastMessageTime = automaticMsg.createdAt;
      if (isSeller) {
        rooms[rIdx].unreadCountBuyer += 1;
      } else {
        rooms[rIdx].unreadCountSeller += 1;
      }
    }

    dbInstance.getAuditLogs().push({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: 'إلغاء/رفض الطلب',
      details: `قام ${isSeller ? 'المورد' : 'المشتري'} ذو المعرف ${userId} بإلغاء/رفض الطلب رقم ${orderId} للمنتج "${order.productTitle}".`,
      adminId: userId,
      adminName: isSeller ? 'المورد' : order.buyerName,
      adminEmail: isSeller ? 'seller@sou9aljoumla.com' : 'buyer@sou9aljoumla.com',
      ip: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, order });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders/:orderId/no-contact', authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId } = req.body;
    if (!userId || !roomId) {
      return res.status(400).json({ error: 'مطلوب تحديد معرف المستخدم والدردشة.' });
    }

    const order = dbInstance.getOrders().find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود.' });
    }

    if (order.sellerId !== userId && order.buyerId !== userId) {
      return res.status(403).json({ error: 'عذراً، لا تمتلك الصلاحية لاتخاذ هذا الإجراء على هذا الطلب.' });
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ error: 'عذراً، الطلب مغلق بالفعل ولا يمكن تحديث حالته لعدم الرد.' });
    }

    order.status = 'cancelled';
    order.noContact = true;

    const isSeller = (order.sellerId === userId);
    const msgText = `⚠️ [تحديث الطلب رقم ${orderId}]: تم إلغاء الطلب تلقائياً وتسجيل حالة "عدم الرد والتواصل" نظراً لعدم استجابة الطرف الآخر للرسائل والمكالمات.`;

    const automaticMsg = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: userId,
      text: msgText,
      imageUrl: '',
      status: 'sent' as const,
      createdAt: new Date().toISOString()
    };
    dbInstance.getMessages().push(automaticMsg);

    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = msgText;
      rooms[rIdx].lastMessageTime = automaticMsg.createdAt;
      if (isSeller) {
        rooms[rIdx].unreadCountBuyer += 1;
      } else {
        rooms[rIdx].unreadCountSeller += 1;
      }
    }

    dbInstance.getAuditLogs().push({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: 'تسجيل حالة عدم رد وتواصل للطلب',
      details: `قام الطرف ذو المعرف ${userId} بتسجيل "عدم الرد" وإلغاء الطلب رقم ${orderId} نظراً لانقطاع تواصل الطرف المقابل.`,
      adminId: userId,
      adminName: isSeller ? 'المورد' : order.buyerName,
      adminEmail: isSeller ? 'seller@sou9aljoumla.com' : 'buyer@sou9aljoumla.com',
      ip: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, order });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders/:orderId/report', authorizeOwnership, (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, roomId, reason, details } = req.body;
    if (!userId || !roomId || !reason) {
      return res.status(400).json({ error: 'بيانات بلاغ الشحن والطلب غير كاملة.' });
    }

    const order = dbInstance.getOrders().find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'الطلب المحدد غير موجود.' });
    }

    const reporter = dbInstance.getUsers().find(u => u.id === userId);
    if (!reporter) {
      return res.status(404).json({ error: 'رقم المستخدم غير صحيح.' });
    }

    const sellerObj = dbInstance.getUsers().find(u => u.id === order.sellerId);
    const buyerObj = dbInstance.getUsers().find(u => u.id === order.buyerId);

    const newReport = {
      id: 'rep-' + Math.random().toString(36).substr(2, 9),
      reporterId: userId,
      reporterName: reporter.name || 'عضو من المنصة',
      targetType: (userId === order.sellerId ? 'buyer' : 'seller') as 'product' | 'comment' | 'seller' | 'message',
      targetId: userId === order.sellerId ? order.buyerId : order.sellerId,
      reason,
      details: details || `بلاغ بخصوص الطلب ${orderId} - سبب: ${reason}`,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    dbInstance.getReports().push(newReport);

    const roomMessages = dbInstance.getMessages().filter(m => m.roomId === roomId);
    const sortedMsgs = roomMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const chatLog = sortedMsgs.map(m => {
      const senderName = m.senderId === order.sellerId 
        ? (sellerObj?.companyName || sellerObj?.name || 'البائع') 
        : (buyerObj?.name || 'المشتري');
      return `[${m.createdAt}] ${senderName}: ${m.text}`;
    }).join('\n');

    const emailBody = `
========================================
🚨 بلاغ إداري وشكوى رسمية بخصوص معاملة تجارية
========================================
تاريخ ووقت البلاغ: ${new Date().toLocaleString('ar-MA')}

[بيانات الطلب]
--------------
مرجع الطلب: ${orderId}
المنتج المطلوب: ${order.productTitle}
الكمية: ${order.quantity} حبة
سعر الوحدة: ${order.unitPrice} MAD
رسوم التوصيل: ${order.shippingCost} MAD
المجموع الإجمالي: ${order.totalPrice} MAD
حالة الطلب الحالية: ${order.status}
تاريخ تقديم الطلب: ${order.createdAt}

[بيانات البائع / التاجر]
-------------------------
الاسم: ${sellerObj?.name || 'غير معروف'}
اسم الشركة: ${sellerObj?.companyName || 'غير متوفر'}
البريد الإلكتروني: ${sellerObj?.email || 'غير متوفر'}
الهاتف: ${sellerObj?.phone || order.buyerPhone}
العنوان والمدينة: ${sellerObj?.city || 'غير متوفر'}

[بيانات المشتري]
------------------
الاسم الكامل: ${buyerObj?.name || order.buyerName}
البريد الإلكتروني: ${buyerObj?.email || 'غير متوفر'}
الهاتف: ${buyerObj?.phone || order.buyerPhone}
عنوان الشحن المحدد: ${order.shippingAddress}

[تفاصيل البلاغ]
----------------
مقدّم البلاغ: ${reporter.name} (${reporter.role === 'seller' ? 'تاجر' : 'مشتري'})
سبب الشكوى: ${reason}
الشرح: ${details || 'لا توجد تفاصيل إضافية مضافة من قبل المبلغ.'}

[السجل الكامل والنسخة النصية للمحادثة]
---------------------------------------
${chatLog || 'لا تتوفر رسائل مسجلة بين الطرفين حتى الآن.'}
========================================
`;

    console.log(`[SIMULATED EMAIL SERVICE] Sending Complaint Email to admin@sou9aljoumla.com...`);
    console.log(emailBody);

    let isSuspendedAction = false;
    if (userId === order.sellerId) {
      reporter.status = 'suspended';
      isSuspendedAction = true;
    }

    dbInstance.getAuditLogs().push({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: 'بلاغ وشكوى تجارية وإيقاف مؤقت',
      details: `قام العضو ${reporter.name} بتقديم بلاغ رسمي ضد الطرف الآخر بخصوص الطلب ${orderId} لسبب: "${reason}". ${isSuspendedAction ? 'تم تقييد حساب التاجر مؤقتاً لمراجعة القضية.' : ''}`,
      adminId: userId,
      adminName: reporter.name,
      adminEmail: reporter.email || 'user@sou9aljoumla.com',
      ip: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();

    res.json({ 
      success: true, 
      reportId: newReport.id,
      suspended: isSuspendedAction,
      message: isSuspendedAction 
        ? 'تم تسجيل البلاغ بنجاح وإرساله لإشراف الإدارة، وتم تقييد الحساب مؤقتاً للسلامة.' 
        : 'تم تسجيل البلاغ وإعلام الإدارة لمراجعة المحادثة والتفاصيل.'
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Comments and Reviews API
app.post('/api/products/:id/comments', generalApiLimiter, (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, userAvatar, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: 'الرجاء إدخال نص التعليق وتحديد المستخدم' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول باستخدام حساب صحيح لكتابة تعليقات.' });
    }

    const newComment: Comment = {
      id: 'cm-' + Math.random().toString(36).substr(2, 9),
      productId: id,
      userId,
      userName: userName || 'مستخدم مسجل',
      userAvatar: userAvatar || '',
      text: sanitizeHTML(text),
      replies: [],
      createdAt: new Date().toISOString()
    };

    dbInstance.getComments().push(newComment);
    dbInstance.save();

    res.json({ success: true, comment: newComment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit advanced review with support for photos/videos, titles, questions and ratings calculation
app.post('/api/products/:id/reviews', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, title, comment, media, question } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'يجب عليك تسجيل الدخول أولاً لإرسال مراجعة' });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: 'الرجاء تحديد تقييم صالح بين 1 و 5 نجوم' });
    }

    // 1. Fetch user & check authentication / verification
    const users = dbInstance.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود بالنظام' });
    }

    // Security check: Only verified logged-in users can review
    if (!user.isVerified && user.verificationStatus !== 'verified') {
      return res.status(403).json({ error: 'عذراً، فقط المستخدمين الموثقين للملف الشخصي (Verified) يمكنهم كتابة تقييمات لمنع التقاييم المزيفة' });
    }

    // 2. Prevent duplicate reviews (One review per user per product)
    const existingReview = dbInstance.getReviews().find(r => r.productId === id && r.userId === userId);
    if (existingReview) {
      return res.status(400).json({ error: 'لقد قمت بإضافة تقييم لهذا المنتج بالفعل. يُسمح بتقييم واحد فقط لكل منتج.' });
    }

    // 3. Create review record
    const newReviewId = 'rev-' + Math.random().toString(36).substr(2, 9);
    const newReview: Review = {
      id: newReviewId,
      productId: id,
      product_id: id,
      userId,
      user_id: userId,
      userName: user.name,
      userAvatar: user.profile_image || '',
      rating: Number(rating),
      title: sanitizeHTML(title || ''),
      comment: sanitizeHTML(comment || ''),
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    dbInstance.getReviews().push(newReview);

    // 4. Save review media (Images / Videos)
    const storedMedia: any[] = [];
    if (Array.isArray(media)) {
      media.forEach((item: any) => {
        const newMedia = {
          id: 'rm-' + Math.random().toString(36).substr(2, 9),
          review_id: newReviewId,
          file_url: item.file_url,
          file_type: item.file_type // 'image' or 'video'
        };
        dbInstance.getReviewMedia().push(newMedia);
        storedMedia.push(newMedia);
      });
    }
    newReview.media = storedMedia;

    // 5. Optional Question creation during review flow
    let createdQuestion: any = null;
    if (question && String(question).trim() !== '') {
      createdQuestion = {
        id: 'q-' + Math.random().toString(36).substr(2, 9),
        product_id: id,
        user_id: userId,
        userName: user.name,
        userAvatar: user.profile_image || '',
        question: sanitizeHTML(String(question).trim()),
        created_at: new Date().toISOString()
      };
      dbInstance.getReviewQuestions().push(createdQuestion);
    }

    // 6. Re-calculate average ratings for product & update
    const allReviewsForProduct = dbInstance.getReviews().filter(r => r.productId === id);
    const totalStars = allReviewsForProduct.reduce((sum, item) => sum + item.rating, 0);
    const avgRating = totalStars / allReviewsForProduct.length;

    const products = dbInstance.getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
       const rounded = Number(avgRating.toFixed(1));
       product.sellerRating = rounded;
    }

    dbInstance.persist();

    res.json({ 
      success: true, 
      review: newReview, 
      question: createdQuestion,
      averageRating: avgRating 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to validate file signatures/headers (File Upload Security - Phase 6)
function validateBufferSignature(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;
  const hex = buffer.toString('hex', 0, 4).toUpperCase();
  
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return hex.startsWith('FFD8');
  }
  if (mimeType === 'image/png') {
    return hex === '89504E47';
  }
  if (mimeType === 'image/webp') {
    return buffer.toString('utf8', 0, 4) === 'RIFF' && buffer.toString('utf8', 8, 12) === 'WEBP';
  }
  if (mimeType === 'application/pdf') {
    return hex === '25504446'; // %PDF
  }
  if (mimeType === 'video/mp4') {
    return buffer.toString('utf8', 4, 12).includes('ftyp');
  }
  
  // High sensitivity scan to block injected PHP/JS/ASP scripts and SVGs masquerading inside other file types (File Upload Security - OWASP)
  const textContent = buffer.toString('utf8').toLowerCase();
  const dangerousPatterns = ['<?php', '<script', '<?', '<html', 'javascript:', 'xml', 'onload=', 'onerror=', '<svg', 'xmlns'];
  const containsHackingPattern = dangerousPatterns.some(pat => textContent.includes(pat));
  if (containsHackingPattern) {
    return false;
  }
  
  return true;
}

// Upload media file with strict server-side size/type validation
app.post('/api/upload-media', generalApiLimiter, (req, res) => {
  try {
    const { fileBase64, fileName, fileType } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: 'الرجاء توفير الملف المرفوع' });
    }

    // Explicitly reject SVGs
    if (fileName && fileName.toLowerCase().endsWith('.svg')) {
      return res.status(400).json({ error: 'ملفات SVG غير مسموح برفعها لأسباب أمنية.' });
    }

    // Match Base64 pattern
    const matches = fileBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    let mimeType = fileType || '';
    let base64Data = fileBase64;
    
    if (matches && matches.length > 1) {
      mimeType = matches[1];
      base64Data = fileBase64.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');
    }

    if (mimeType && mimeType.includes('svg')) {
      return res.status(400).json({ error: 'ملفات SVG غير مسموح برفعها لأسباب أمنية.' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const actualSize = buffer.length;

    // Server-side validation
    const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov'];
    
    const isImage = allowedImageMimes.includes(mimeType);
    const isVideo = allowedVideoMimes.includes(mimeType);

    if (!isImage && !isVideo) {
      return res.status(400).json({ error: 'نوع الملف غير مدعوم. المسموح به صور (JPG, JPEG, PNG, WEBP) وفيديوهات (MP4, WEBM, MOV) فقط.' });
    }

    // Perform deep content-type verification check against spoofed extensions (File Upload Security - Phase 6)
    if (!validateBufferSignature(buffer, mimeType)) {
      securityLogger.warn({ event: 'MALICIOUS_FILE_UPLOAD_BLOCKED_SIGNATURE', filename: fileName, mimeType, ip: req.ip });
      return res.status(400).json({ error: 'تنبيه أمني: هيدر الملف الحقيقي لا يطابق نوع الامتداد المصرح به. تم حظر محاولة رفع الملف.' });
    }

    // Enforce enterprise grade 5MB limit
    const maxFileSize = 5 * 1024 * 1024; // 5MB limit
    if (actualSize > maxFileSize) {
      return res.status(400).json({ error: 'عذراً، يتعدى حجم الملف الحد الأقصى المسموح به (5 ميغابايت).' });
    }

    let extension = 'png';
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') extension = 'jpg';
    else if (mimeType === 'image/webp') extension = 'webp';
    else if (mimeType === 'video/mp4') extension = 'mp4';
    else if (mimeType === 'video/webm') extension = 'webm';
    else if (mimeType === 'video/quicktime' || mimeType === 'video/mov') extension = 'mov';

    const cleanFilename = `review-media-${crypto.randomUUID()}.${extension}`;
    const targetPath = path.join(process.cwd(), 'data', 'uploads', cleanFilename);

    // Write file to filesystem
    fs.writeFileSync(targetPath, buffer);

    res.json({
      success: true,
      file_url: `/uploads/${cleanFilename}`,
      file_type: isImage ? 'image' : 'video'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Upload advertising booking document with strict validation
app.post('/api/upload-booking-document', generalApiLimiter, (req, res) => {
  try {
    const { fileBase64, fileName, fileType } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: 'الرجاء توفير الملف المرفوع' });
    }

    if (fileName && fileName.toLowerCase().endsWith('.svg')) {
      return res.status(400).json({ error: 'ملفات SVG غير مسموح برفعها لأسباب أمنية.' });
    }

    // Match Base64 pattern
    const matches = fileBase64.match(/^data:([a-zA-Z0-9-]+\/[a-zA-Z0-9-.+]+);base64,/);
    let mimeType = fileType || '';
    let base64Data = fileBase64;
    
    if (matches && matches.length > 1) {
      mimeType = matches[1];
      base64Data = fileBase64.replace(/^data:([a-zA-Z0-9-]+\/[a-zA-Z0-9-.+]+);base64,/, '');
    }

    if (mimeType && mimeType.includes('svg')) {
      return res.status(400).json({ error: 'ملفات SVG غير مسموح برفعها لأسباب أمنية.' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const actualSize = buffer.length;

    // Allowed MIMEs: images (jpg, png, webp), pdf, doc, docx
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimes.includes(mimeType)) {
      return res.status(400).json({ error: 'نوع الملف غير مدعوم. المسموح به صور (JPG, JPEG, PNG, WEBP) وملفات PDF ومستندات Word (DOC, DOCX) فقط.' });
    }

    // Perform deep content-type verification check against spoofed extensions (File Upload Security - Phase 6)
    if (!validateBufferSignature(buffer, mimeType)) {
      securityLogger.warn({ event: 'MALICIOUS_DOCUMENT_UPLOAD_BLOCKED_SIGNATURE', filename: fileName, mimeType, ip: req.ip });
      return res.status(400).json({ error: 'تنبيه أمني: هيدر المستند المدخل لا يطابق نوع الامتداد المصرح به. تم حظر محاولة رفع الملف.' });
    }

    // 5MB limit per file
    const maxSize = 5 * 1024 * 1024;
    if (actualSize > maxSize) {
      return res.status(400).json({ error: 'يتعدى حجم الملف الحد الأقصى المسموح به (5 ميغابايت).' });
    }

    // Determine secure extension based on MIME type to avoid extension spoofing
    let extension = '';
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      extension = 'jpg';
    } else if (mimeType === 'image/png') {
      extension = 'png';
    } else if (mimeType === 'image/webp') {
      extension = 'webp';
    } else if (mimeType === 'application/pdf') {
      extension = 'pdf';
    } else if (mimeType === 'application/msword') {
      extension = 'doc';
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extension = 'docx';
    } else {
      return res.status(400).json({ error: 'نوع الملف غير صالح.' });
    }

    // Prevent malicious files by double checking client filename suffix
    if (fileName) {
      const lowerName = fileName.toLowerCase();
      const blockedExtensions = ['.exe', '.js', '.php', '.sh', '.html', '.htm', '.jsp', '.asp', '.aspx', '.py', '.pl', '.rb', '.cgi', '.bat', '.cmd', '.svg'];
      const hasBlocked = blockedExtensions.some(ext => lowerName.endsWith(ext));
      if (hasBlocked) {
        return res.status(400).json({ error: 'نوع غير صالِح أو الملفات التنفيذية والبرمجية محظورة تماماً لأسباب أمنية.' });
      }
    }

    const cleanFilename = `booking-doc-${crypto.randomUUID()}.${extension}`;
    const targetPath = path.join(process.cwd(), 'data', 'uploads', cleanFilename);

    // Save to server
    fs.writeFileSync(targetPath, buffer);

    res.json({
      success: true,
      file_url: `/uploads/${cleanFilename}`,
      file_name: fileName || cleanFilename,
      file_size: actualSize
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Product owner answers question
app.post('/api/questions/:questionId/answers', (req, res) => {
  try {
    const { questionId } = req.params;
    const { sellerId, answer, sellerName, sellerAvatar } = req.body;

    if (!sellerId || !answer) {
      return res.status(400).json({ error: 'الرجاء توفير معرف البائع والجواب' });
    }

    const questions = dbInstance.getReviewQuestions();
    const q = questions.find(item => item.id === questionId);
    if (!q) {
      return res.status(404).json({ error: 'السؤال غير متوفر' });
    }

    const products = dbInstance.getProducts();
    const product = products.find(p => p.id === q.product_id);
    if (!product || product.sellerId !== sellerId) {
      return res.status(403).json({ error: 'غير مصرح لك بالجواب على هذا السؤال، فقط صاحب السلعة من يمكنه الرد' });
    }

    const newAnswer = {
      id: 'ans-' + Math.random().toString(36).substr(2, 9),
      question_id: questionId,
      seller_id: sellerId,
      sellerName: sellerName || product.sellerName || 'البائع',
      sellerAvatar: sellerAvatar || '',
      answer,
      created_at: new Date().toISOString()
    };

    dbInstance.getReviewAnswers().push(newAnswer);
    dbInstance.persist();

    res.json({ success: true, answer: newAnswer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Users can submit a question directly from the reviews area
app.post('/api/products/:id/questions', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, question, userName, userAvatar } = req.body;

    if (!userId || !question) {
      return res.status(400).json({ error: 'الرجاء كتابة السؤال للتواصل مع البائع' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.id === userId);

    const newQuestion = {
      id: 'q-' + Math.random().toString(36).substr(2, 9),
      product_id: id,
      user_id: userId,
      userName: user ? user.name : (userName || 'مشتري'),
      userAvatar: user ? (user.profile_image || '') : (userAvatar || ''),
      question: sanitizeHTML(String(question).trim()),
      created_at: new Date().toISOString()
    };

    dbInstance.getReviewQuestions().push(newQuestion);
    dbInstance.persist();

    res.json({ success: true, question: newQuestion });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Seller replies to a review
app.post('/api/reviews/:reviewId/reply', (req, res) => {
  try {
    const { reviewId } = req.params;
    const { sellerId, text } = req.body;

    if (!sellerId || !text) {
      return res.status(400).json({ error: 'الرجاء كتابة تعليق الرد' });
    }

    const reviews = dbInstance.getReviews();
    const review = reviews.find(r => r.id === reviewId);
    if (!review) {
      return res.status(404).json({ error: 'التقييم غير موجود' });
    }

    const products = dbInstance.getProducts();
    const product = products.find(p => p.id === review.productId);
    if (!product || product.sellerId !== sellerId) {
      return res.status(403).json({ error: 'غير مصرح لك بالرد، صاحب المنتج فقط من يحق له التعليق' });
    }

    review.sellerReply = {
      id: 'rep-' + Math.random().toString(36).substr(2, 5),
      sellerId,
      text: sanitizeHTML(text),
      createdAt: new Date().toISOString()
    };

    dbInstance.persist();
    res.json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Moderation: Delete review
app.delete('/api/admin/reviews/:reviewId', (req, res) => {
  try {
    const { reviewId } = req.params;
    const { adminId } = req.query;

    const users = dbInstance.getUsers();
    const adminUser = users.find(u => u.id === adminId);
    if (!adminUser || !['superadmin', 'admin', 'moderator'].includes(adminUser.role)) {
      return res.status(403).json({ error: 'غير مسموح. للمشرفين فقط.' });
    }

    const reviews = dbInstance.getReviews();
    const idx = reviews.findIndex(r => r.id === reviewId);
    if (idx !== -1) {
      const deletedReview = reviews.splice(idx, 1)[0];
      
      // Delete media associated with deleted review
      const mediaList = dbInstance.getReviewMedia();
      const filteredMedia = mediaList.filter(m => m.review_id !== reviewId);
      dbInstance.setReviewMedia(filteredMedia);

      // Update average rating
      const allReviewsForProduct = dbInstance.getReviews().filter(r => r.productId === deletedReview.productId);
      const avgRating = allReviewsForProduct.length > 0
        ? allReviewsForProduct.reduce((sum, item) => sum + item.rating, 0) / allReviewsForProduct.length
        : 5.0;

      const products = dbInstance.getProducts();
      const product = products.find(p => p.id === deletedReview.productId);
      if (product) {
        product.sellerRating = Number(avgRating.toFixed(1));
      }

      dbInstance.persist();
      return res.json({ success: true });
    }

    res.status(404).json({ error: 'التقييم غير متوفر' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Moderation: Delete specific photo or video from a review
app.delete('/api/admin/reviews/:reviewId/media/:mediaId', (req, res) => {
  try {
    const { reviewId, mediaId } = req.params;
    const { adminId } = req.query;

    const users = dbInstance.getUsers();
    const adminUser = users.find(u => u.id === adminId);
    if (!adminUser || !['superadmin', 'admin', 'moderator'].includes(adminUser.role)) {
      return res.status(403).json({ error: 'غير مسموح. للمشرفين فقط.' });
    }

    const mediaList = dbInstance.getReviewMedia();
    const idx = mediaList.findIndex(m => m.id === mediaId && m.review_id === reviewId);
    if (idx !== -1) {
      mediaList.splice(idx, 1);
      dbInstance.persist();
      return res.json({ success: true });
    }

    res.status(404).json({ error: 'الوسائط غير موجودة' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Moderation: Hide inappropriate content (Flag as hidden)
app.post('/api/admin/reviews/:reviewId/hide', (req, res) => {
  try {
    const { reviewId } = req.params;
    const { adminId, hide } = req.body;

    const users = dbInstance.getUsers();
    const adminUser = users.find(u => u.id === adminId);
    if (!adminUser || !['superadmin', 'admin', 'moderator'].includes(adminUser.role)) {
      return res.status(403).json({ error: 'غير مسموح. للمشرفين فقط.' });
    }

    const reviews = dbInstance.getReviews();
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      review.isHidden = hide ?? true;
      dbInstance.persist();
      return res.json({ success: true, review });
    }

    res.status(404).json({ error: 'التقييم غير متوفر' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Wallet, top-up and points codes redemption
app.get('/api/wallet/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  const txs = dbInstance.getWalletTransactions().filter(t => t.userId === userId);
  res.json(txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

// Coupon Application Check
app.post('/api/coupons/apply', (req, res) => {
  try {
    const { code, userId } = req.body;
    if (!code || !userId) {
      return res.status(400).json({ error: 'الرجاء إدخال كود الكوبون' });
    }

    const coupons = dbInstance.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

    if (!coupon) {
      return res.status(404).json({ error: 'الكوبون غير صالح أو تم حذفه.' });
    }

    if (coupon.status === 'inactive') {
      return res.status(400).json({ error: 'عذراً، الكوبون متوقف حالياً بالمنصة' });
    }

    if (coupon.status === 'used') {
      return res.status(400).json({ error: 'عذراً، تم استخدام هذا الكوبون مسبقاً' });
    }

    if (new Date(coupon.expiryDate).getTime() < new Date().getTime()) {
      return res.status(400).json({ error: 'عذراً، انتهت صلاحية هذا الكوبون' });
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'عذراً، لقد استكمل هذا الكوبون الحد الأقصى للاستخدامات' });
    }

    // Success Coupon Return
    res.json({ success: true, coupon });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Recharge code redemption
app.post('/api/wallet/redeem-code', (req, res) => {
  try {
    const { code, userId } = req.body;
    if (!code || !userId) {
      return res.status(400).json({ error: 'الرجاء إدخال كود الشحن' });
    }

    const ip = getClientIp(req);
    const rateLimitKey = `${ip}-${userId}`;
    if (!checkRateLimit(rateLimitKey, redeemRateLimits, 5, 1 * 60 * 1000)) {
      return res.status(429).json({ error: 'لقد تجاوزت الحد الأقصى لمحاولات إدخال الأكواد. يرجى الانتظار لمدة دقيقة واحدة ومحاولة مجدداً لسلامة حسابك.' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير متوفر' });
    }

    const codes = dbInstance.getRechargeCodes();
    const codeIndex = codes.findIndex(c => c.code.toUpperCase() === code.trim().toUpperCase());

    if (codeIndex !== -1) {
      const rechargeCode = codes[codeIndex];
      if (rechargeCode.status === 'used') {
        return res.status(400).json({ error: 'عذراً، هذا الكود تم استخدامه مسبقاً بالمنصة' });
      }

      if (new Date(rechargeCode.expiryDate).getTime() < new Date().getTime()) {
        return res.status(400).json({ error: 'عذراً، كود الشحن منتهي الصلاحية' });
      }

      // Approve redemption
      user.points += rechargeCode.points;
      rechargeCode.status = 'used';
      rechargeCode.usedBy = user.id;
      rechargeCode.usedAt = new Date().toISOString();

      // Create wallet transaction log
      dbInstance.getWalletTransactions().push({
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        type: 'credit',
        amount: 0,
        points: rechargeCode.points,
        description: `شحن نقاط عبر كود الشحن المباشر من الإدارة: ${rechargeCode.code}`,
        createdAt: new Date().toISOString(),
        status: 'completed'
      });

      dbInstance.persist();

      return res.json({ 
        success: true, 
        pointsAdded: rechargeCode.points, 
        newPoints: user.points 
      });
    }

    // Attempt coupon lookup if it is points-based
    const coupons = dbInstance.getCoupons();
    const couponIndex = coupons.findIndex(c => c.code.toUpperCase() === code.trim().toUpperCase());

    if (couponIndex !== -1) {
      const coupon = coupons[couponIndex];
      if (coupon.status === 'used') {
        return res.status(400).json({ error: 'عذراً، قسيمة الهدايا هذه تم استخدامها مسبقاً' });
      }
      if (coupon.status === 'inactive') {
        return res.status(400).json({ error: 'عذراً، هذه القسيمة غير مفعّلة حالياً' });
      }
      if (new Date(coupon.expiryDate).getTime() < new Date().getTime()) {
        return res.status(400).json({ error: 'عذراً، انتهت صلاحية هذه القسيمة' });
      }

      let pointsReward = coupon.value;
      let description = `تفعيل نقاط قسيمة هدايا: ${coupon.code}`;

      user.points += pointsReward;
      coupon.status = 'used';
      coupon.usageCount = (coupon.usageCount || 0) + 1;
      (coupon as any).usedBy = user.id;
      (coupon as any).usedAt = new Date().toISOString();

      dbInstance.getWalletTransactions().push({
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        type: 'credit',
        amount: 0,
        points: pointsReward,
        description,
        createdAt: new Date().toISOString(),
        status: 'completed'
      });

      dbInstance.persist();

      return res.json({
        success: true,
        pointsAdded: pointsReward,
        newPoints: user.points
      });
    }

    return res.status(404).json({ error: 'كود الشحن غير صالح أو تم حذفه.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Simulated payment Gateway - Stripe / PayPal Packages Recharge
app.post('/api/wallet/recharge-payment', (req, res) => {
  try {
    const { userId, packageId, paymentMethod, cardNumber, localCode } = req.body;
    if (!userId || !packageId) {
      return res.status(400).json({ error: 'الرجاء تقديم كافة معلومات باقة الشحن وقناة الدفع' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير متوفر' });
    }

    // Verify package structure strictly on server to prevent parameter tampering
    const settings = dbInstance.getSettings();
    const defaultPackages = [
      { id: 'p_starter', name: 'الباقة البرونزية', points: 60, priceUsd: 5 },
      { id: 'p_basic', name: 'الباقة الفضية', points: 230, priceUsd: 10 },
      { id: 'p_pro', name: 'الباقة الذهبية (الموصى بها)', points: 470, priceUsd: 20 },
      { id: 'p_premium', name: 'الباقة البلاتينية', points: 1200, priceUsd: 50 }
    ];
    const packages = settings.packages || defaultPackages;
    const selectedPack = packages.find((p: any) => p.id === packageId);
    if (!selectedPack) {
      return res.status(400).json({ error: 'باقة الشحن المحددة غير صالحة ولا تتوفر بالنظام.' });
    }

    const verifiedPoints = Number(selectedPack.points);
    const verifiedAmount = Number(selectedPack.priceUsd) * 10; // Convert USD base to estimated MAD

    const invId = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const txId = 'tx-' + Math.random().toString(36).substr(2, 9);

    let description = '';
    let status: 'pending' | 'completed' | 'failed' = 'pending';

    // Verify method and enforce pending for manual channels (to satisfy checking before granting points!)
    if (paymentMethod === 'card') {
      const maskedCard = cardNumber ? `Visa/MC (**** ${cardNumber.slice(-4)})` : 'بطاقة بنكية';
      description = `طلب شحن معلق عبر البطاقة البنكية: ${maskedCard} (قيد التدقيق التلقائي)`;
      status = 'pending';
    } else if (paymentMethod === 'local') {
      description = `طلب شحن معلق وكالة كاش بلوس/وفاكاش - كود: ${localCode || 'غير معروف'} (قيد التدقيق)`;
      status = 'pending';
    } else if (paymentMethod === 'paypal') {
      description = `طلب شحن معلق عبر PayPal - بانتظار التحقق الفعلي من البوابة`;
      status = 'pending';
    } else {
      return res.status(400).json({ error: 'قناة الدفع المحددة غير صالحة أو غير مدعومة بالمنصة لتفادي التلاعب بالنقاط يدوياً.' });
    }

    dbInstance.getWalletTransactions().push({
      id: txId,
      userId: user.id,
      type: 'credit',
      amount: verifiedAmount,
      points: verifiedPoints,
      description,
      createdAt: new Date().toISOString(),
      status,
      invoiceId: invId
    });

    dbInstance.persist();

    res.json({
      success: true,
      status,
      pointsAdded: 0,
      newPoints: user.points,
      invoiceId: invId,
      amount: verifiedAmount
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PayPal Config Endpoint
app.get('/api/paypal/config', (req, res) => {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID || 'sb'
  });
});

// Secure PayPal Server-Side Verification Endpoint
app.post('/api/wallet/verify-paypal', paypalVerifyLimiter, async (req, res) => {
  try {
    const { userId, orderId, packageId } = req.body;
    if (!userId || !orderId || !packageId) {
      return res.status(400).json({ error: 'معلومات الدفع غير مكتملة' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير متوفر' });
    }

    // Verify package first against secure server package config database
    const settings = dbInstance.getSettings();
    const defaultPackages = [
      { id: 'p_starter', name: 'الباقة البرونزية', points: 60, priceUsd: 5 },
      { id: 'p_basic', name: 'الباقة الفضية', points: 230, priceUsd: 10 },
      { id: 'p_pro', name: 'الباقة الذهبية (الموصى بها)', points: 470, priceUsd: 20 },
      { id: 'p_premium', name: 'الباقة البلاتينية', points: 1200, priceUsd: 50 }
    ];
    const packages = settings.packages || defaultPackages;
    const selectedPack = packages.find((p: any) => p.id === packageId);
    if (!selectedPack) {
      return res.status(400).json({ error: 'باقة الشحن المحددة معيبة أو غير متوفرة بالنظام.' });
    }

    const verifiedPoints = Number(selectedPack.points);
    const verifiedAmountUsd = Number(selectedPack.priceUsd);

    // Prevent Double-Spending (replays)
    const existingTx = dbInstance.getWalletTransactions().find(t => t.invoiceId === orderId);
    if (existingTx) {
      return res.status(400).json({ error: 'عذراً، تم تفعيل واستخدام معاملة PayPal هذه مسبقاً بالشحن.' });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not found in environment variables.');
      return res.status(400).json({ error: 'بوابة الدفع PayPal معطلة مؤقتاً لعدم ربط مفاتيح العميل بالإدارة. يرجى الاتصال بنا للمساعدة في شحن حسابك يدوياً.' });
    }

    let isRealVerified = false;

    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const isProd = process.env.PAYPAL_MODE === 'production';
      const baseUrl = isProd ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

      // Fetch Access token
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // Fetch order details from PayPal Orders API
        const orderRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          const status = orderData.status; // strictly check COMPLETED
          const valueStr = orderData.purchase_units?.[0]?.amount?.value;
          const valueNum = Number(valueStr);
          const pCustomId = orderData.purchase_units?.[0]?.custom_id || orderData.purchase_units?.[0]?.custom || '';
          const payeeEmail = orderData.purchase_units?.[0]?.payee?.email_address || '';
          const expectedMerchantEmail = process.env.PAYPAL_PAYEE_EMAIL || 'paypal@sou9aljoumla.com';

          // Strictly require COMPLETED status and <= 0.01 USD deviation (Phases 4, 5, 6, 12)
          if (status === 'COMPLETED' && Math.abs(valueNum - verifiedAmountUsd) <= 0.01) {
            if (pCustomId && pCustomId !== userId) {
              console.warn(`[PAYPAL HIJACK GUARD] Attempted hijack. Order custom_id=${pCustomId} doesn't match session user=${userId}`);
              isRealVerified = false;
              securityLogger.warn({
                event: 'PAYPAL_HIJACK_ATTEMPT',
                userId,
                pCustomId,
                orderId,
                ip: req.ip
              });
            } else if (payeeEmail && payeeEmail.toLowerCase() !== expectedMerchantEmail.toLowerCase()) {
              console.warn(`[PAYPAL MERCHANT GUARD] Payment sent to unexpected payee: ${payeeEmail}`);
              isRealVerified = false;
              securityLogger.warn({
                event: 'PAYPAL_MERCHANT_FRAUD_ATTEMPT',
                userId,
                payeeEmail,
                expectedMerchantEmail,
                orderId,
                ip: req.ip
              });
            } else {
              isRealVerified = true;
            }
          } else {
            console.warn(`PayPal order check mismatch: expected=${verifiedAmountUsd}, got=${valueNum}, status=${status}`);
            paymentsLogger.warn({
              event: 'PAYPAL_PAYMENT_MISMATCH',
              userId,
              orderId,
              status,
              gotAmount: valueNum,
              expectedAmount: verifiedAmountUsd,
              ip: req.ip
            });
          }
        }
      }
    } catch (err) {
      console.error('PayPal API server validation failed:', err);
    }

    if (!isRealVerified) {
      return res.status(400).json({ error: 'فشل التحقق من معاملة PayPal مع خوادم بايبال الرسمية.' });
    }

    // Success - award verified points only
    user.points += verifiedPoints;

    // Save transactional log with verified parameters
    dbInstance.getWalletTransactions().push({
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type: 'credit',
      amount: verifiedAmountUsd * 10, // MAD equivalent
      points: verifiedPoints,
      description: `شحن محفظة آلي وتلقائي معتمد عبر بوابة بايبال (PayPal) - معاملة رقم ${orderId}`,
      createdAt: new Date().toISOString(),
      status: 'completed',
      invoiceId: orderId
    });

    dbInstance.persist();

    res.json({
      success: true,
      pointsAdded: verifiedPoints,
      newPoints: user.points,
      invoiceId: orderId,
      amount: verifiedAmountUsd * 10
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Asynchronous Verified Webhook capture endpoint with direct PayPal server-to-server validation and anti-spoofing
app.post('/api/payment/webhook', webhookLimiter, async (req, res) => {
  try {
    const event = req.body;
    if (!event || event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return res.json({ received: true, ignored: true });
    }

    const resource = event.resource;
    const captureId = resource?.id;
    if (!captureId) {
      return res.status(400).json({ error: 'Missing capture ID' });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn('[WEBHOOK ERROR] PayPal credentials missing, unable to verify incoming capture.');
      return res.status(400).json({ error: 'PayPal credentials missing' });
    }

    // Double-spending / Replay Attack Guard using persistent invoice IDs
    const transactions = dbInstance.getWalletTransactions();
    const existing = transactions.find(t => t.invoiceId === captureId);
    if (existing) {
      console.warn(`[WEBHOOK REPLAY BLOCK] Transaction with captureId ${captureId} was already processed.`);
      return res.status(409).json({ error: 'Duplicate transaction blocked' });
    }

    // Direct Secure verification with PayPal API to avoid body tampering
    let isRealCaptureVerified = false;
    let actualAmountUsd = 0;
    let actualCustomId = '';

    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const isProd = process.env.PAYPAL_MODE === 'production';
      const baseUrl = isProd ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

      // 1. Fetch access token
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // Optional Webhook Signature Verification against PayPal API (Phase 3)
        let isSignatureVerified = false;
        try {
          const verifyBody = {
            auth_algo: req.headers['paypal-auth-algo'] || req.headers['PAYPAL-AUTH-ALGO'] || '',
            cert_url: req.headers['paypal-cert-url'] || req.headers['PAYPAL-CERT-URL'] || '',
            transmission_id: req.headers['paypal-transmission-id'] || req.headers['PAYPAL-TRANSMISSION-ID'] || '',
            transmission_sig: req.headers['paypal-transmission-sig'] || req.headers['PAYPAL-TRANSMISSION-SIG'] || '',
            transmission_time: req.headers['paypal-transmission-time'] || req.headers['PAYPAL-TRANSMISSION-TIME'] || '',
            webhook_id: process.env.PAYPAL_WEBHOOK_ID || 'sb-default',
            webhook_event: event
          };

          const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(verifyBody)
          });

          if (verifyRes.ok) {
            const verifyResult = await verifyRes.json();
            if (verifyResult.verification_status === 'SUCCESS') {
              isSignatureVerified = true;
            }
          }
        } catch (sigErr) {
          console.error('[SIGNATURE LOG EXCEPTION] Webhook verification method skipped.', sigErr);
        }

        // Strict signature check if webhook environment ID is configured (Phase 3)
        if (process.env.PAYPAL_WEBHOOK_ID && !isSignatureVerified) {
          console.warn(`[WEBHOOK SIGNATURE FALSIFIED] Signature mismatch on Capture ID ${captureId}.`);
          securityLogger.warn({
            event: 'WEBHOOK_SIGNATURE_FAILED',
            captureId,
            ip: req.ip
          });
          return res.status(401).json({ error: 'Falsified signature' });
        }

        // 2. Fetch specific capture details directly from PayPal API (Phase 6)
        const captureRes = await fetch(`${baseUrl}/v2/payments/captures/${captureId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (captureRes.ok) {
          const captureData = await captureRes.json();
          const pStatus = captureData.status; // strictly check COMPLETED
          const pAmount = captureData.amount?.value;
          const pCustomId = captureData.custom_id || captureData.custom || '';
          
          // payee is inside purchase_unit or top level payee property
          const payeeEmail = captureData.payee?.email_address || captureData.seller_receivable_breakdown?.payee?.email_address || '';
          const expectedMerchantEmail = process.env.PAYPAL_PAYEE_EMAIL || 'paypal@sou9aljoumla.com';

          if (pStatus === 'COMPLETED') {
            if (payeeEmail && payeeEmail.toLowerCase() !== expectedMerchantEmail.toLowerCase()) {
              console.warn(`[PAYPAL Webhook Merchant Guard] Payment sent to unexpected payee matching: ${payeeEmail}`);
              securityLogger.warn({
                event: 'WEBHOOK_MERCHANT_FRAUD_ATTEMPT',
                payeeEmail,
                expectedMerchantEmail,
                captureId,
                ip: req.ip
              });
            } else {
              isRealCaptureVerified = true;
              actualAmountUsd = Number(pAmount);
              actualCustomId = pCustomId;
            }
          }
        }
      }
    } catch (err) {
      console.error('[WEBHOOK VERIFY ERR]', err);
    }

    if (!isRealCaptureVerified) {
      console.warn(`[WEBHOOK SPOOF ALERT] Webhook payload specified Capture ID ${captureId} but direct PayPal API check failed.`);
      return res.status(403).json({ error: 'Unverified or spoofed payment webhook blocked' });
    }

    // Get the package corresponding to this verified amount
    const defaultPackages = [
      { id: 'p_starter', name: 'الباقة البرونزية', points: 60, priceUsd: 5 },
      { id: 'p_basic', name: 'الباقة الفضية', points: 230, priceUsd: 10 },
      { id: 'p_pro', name: 'الباقة الذهبية (الموصى بها)', points: 470, priceUsd: 20 },
      { id: 'p_premium', name: 'الباقة البلاتينية', points: 1200, priceUsd: 50 }
    ];
    const settings = dbInstance.getSettings();
    const packages = settings.packages || defaultPackages;
    
    // Find precise package matching actual verified USD layout (Phases 4 & 5)
    const closestPack = packages.find((p: any) => Math.abs(Number(p.priceUsd) - actualAmountUsd) <= 0.01);
    
    if (!closestPack) {
      console.warn(`[WEBHOOK FRAUD RISK] Capture payment amount of ${actualAmountUsd} USD does not match any official package pricing.`);
      securityLogger.warn({
        event: 'WEBHOOK_INVALID_AMOUNT_FRAUD',
        actualAmountUsd,
        captureId,
        ip: req.ip
      });
      return res.status(400).json({ error: 'Invalid PayPal recharge amount' });
    }

    // Find custom_id representing user ID
    if (!actualCustomId) {
      console.warn(`[WEBHOOK ERROR] Capture ${captureId} verified but missing custom_id for user allocation.`);
      return res.status(400).json({ error: 'Missing custom_id user mapping' });
    }

    const user = dbInstance.getUsers().find(u => u.id === actualCustomId);
    if (!user) {
      console.warn(`[WEBHOOK ERROR] User ID ${actualCustomId} not found for capture ${captureId}.`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Verified success - award points ONLY here on Server-Side after PayPal confirmed check
    user.points += Number(closestPack.points);

    // Create persistent transaction registry
    transactions.push({
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type: 'credit',
      amount: Number(closestPack.priceUsd) * 10, // MAD estimate
      points: Number(closestPack.points),
      description: `شحن فوري معزز وموثق بنجاح عبر بوابة الـ Webhook الفورية - معرف الدفع: ${captureId}`,
      createdAt: new Date().toISOString(),
      status: 'completed',
      invoiceId: captureId
    });

    dbInstance.persist();
    console.log(`[PAYMENT WEBHOOK SUCCESS] Capture verified with PayPal API. Added +${closestPack.points} points to user ${user.id}.`);
    
    paymentsLogger.info({
      event: 'PAYPAL_WEBHOOK_CREDITED',
      userId: user.id,
      captureId,
      amountUsd: actualAmountUsd,
      points: closestPack.points
    });

    res.json({ received: true, verified: true });
  } catch (err: any) {
    console.error('[WEBHOOK HANDLER ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin endpoint to Approve pending Recharge Transactions
app.post('/api/admin/approve-transaction', (req, res) => {
  try {
    const { transactionId, adminId } = req.body;
    if (!transactionId || !adminId) {
      return res.status(400).json({ error: 'بيانات غير كاملة' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، فقط المسؤولين أو المدير العام مخولين بالموافقة على الدفعات' });
    }

    const txs = dbInstance.getWalletTransactions();
    const tx = txs.find(t => t.id === transactionId);
    if (!tx) {
      return res.status(404).json({ error: 'لم يتم العثور على المعاملة المطلوبة' });
    }

    if (tx.status === 'completed') {
      return res.status(400).json({ error: 'هذه المعاملة تم شحنها مسبقاً للعميل ومكتملة' });
    }

    const users = dbInstance.getUsers();
    const user = users.find(u => u.id === tx.userId);
    if (!user) {
      return res.status(404).json({ error: 'العضو صاحب المعاملة غير موجود حالياً' });
    }

    // Complete transaction
    tx.status = 'completed';
    user.points += Number(tx.points);

    // Create Audit log
    dbInstance.getAuditLogs().push({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: 'شحن رصيد - موافقة إدارية',
      details: `وافق المدير ${admin.name} على معاملة الشحن رقم ${tx.id} وقام يدوياً بإضافة +${tx.points} نقطة للعضو ${user.name} بعد التأكد من صحة الدفع.`,
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email || 'admin@sou9aljoumla.com',
      ip: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();

    res.json({
      success: true,
      pointsAdded: tx.points,
      newPoints: user.points,
      status: 'completed'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoint to Reject/Deny pending Recharge Transactions
app.post('/api/admin/reject-transaction', (req, res) => {
  try {
    const { transactionId, adminId, reason } = req.body;
    if (!transactionId || !adminId) {
      return res.status(400).json({ error: 'بيانات غير كاملة' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، فقط المدير العام قادر على رفض معاملات الدفع' });
    }

    const txs = dbInstance.getWalletTransactions();
    const tx = txs.find(t => t.id === transactionId);
    if (!tx) {
      return res.status(404).json({ error: 'لم يتم العثور على المعاملة المطلوبة' });
    }

    if (tx.status !== 'pending') {
      return res.status(400).json({ error: 'لا يمكن رفض معاملة منتهية أو مكتملة مسبقاً' });
    }

    // Refuse payment
    tx.status = 'failed';
    tx.description += ` (تم الإلغاء والرفض من الإدارة: ${reason || 'لم يتم استلام الدفعة في حسابنا البنكي'})`;

    // Audit log
    dbInstance.getAuditLogs().push({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: 'شحن رصيد - رفض وإلغاء العملية',
      details: `رفض المدير ${admin.name} معاملة الشحن رقم ${tx.id} وقام بإلغائها بسبب: ${reason || 'عدم توافق البيانات أو عدم استلام الدفعة'}`,
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email || 'admin@sou9aljoumla.com',
      ip: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();

    res.json({
      success: true,
      status: 'failed'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Chat Room Setup and Messages
app.get('/api/chats/rooms/:userId', (req, res) => {
  const { userId } = req.params;
  const rooms = dbInstance.getChatRooms().filter(r => r.buyerId === userId || r.sellerId === userId);
  res.json(rooms);
});

app.get('/api/chats/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const msgs = dbInstance.getMessages().filter(m => m.roomId === roomId);
  res.json(msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
});

app.post('/api/chats/rooms/initiate', (req, res) => {
  try {
    const { buyerId, sellerId } = req.body;
    if (!buyerId || !sellerId) {
      return res.status(400).json({ error: 'الرجاء تحديد المشتري والبائع لبدء المحادثة' });
    }

    const rooms = dbInstance.getChatRooms();
    let room = rooms.find(r => r.buyerId === buyerId && r.sellerId === sellerId);

    if (!room) {
      const users = dbInstance.getUsers();
      const buyer = users.find(u => u.id === buyerId);
      const seller = users.find(u => u.id === sellerId);

      room = {
        id: 'room-' + Math.random().toString(36).substr(2, 9),
        buyerId,
        sellerId,
        buyerName: buyer?.name || 'مشتري',
        sellerName: seller?.companyName || seller?.name || 'مورد الجملة',
        buyerLogo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        sellerLogo: seller?.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200',
        lastMessage: 'أهلاً بك، كيف يمكنني مساعدتك بخصوص بضائع الجملة؟',
        lastMessageTime: new Date().toISOString(),
        unreadCountBuyer: 0,
        unreadCountSeller: 1
      };

      rooms.push(room);

      // Create initial greetings message
      dbInstance.getMessages().push({
        id: 'msg-init',
        roomId: room.id,
        senderId: sellerId,
        text: 'مرحباً بك! أنا مستعد لتلقي استفسارك وتجهيز كميات الجملة والشحن المباشر بمختلف المدن المغربية.',
        createdAt: new Date().toISOString(),
        status: 'read'
      });

      dbInstance.persist();
    }

    res.json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chats/messages/send', generalApiLimiter, (req, res) => {
  try {
    const { roomId, senderId, text, imageUrl } = req.body;
    if (!roomId || !senderId || !text) {
      return res.status(400).json({ error: 'الرسالة غير كاملة' });
    }

    const sanitizedText = sanitizeHTML(text);
    const msg: Message = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId,
      text: sanitizedText,
      imageUrl: imageUrl || '',
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    dbInstance.getMessages().push(msg);

    // Update last message in room
    const rooms = dbInstance.getChatRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx !== -1) {
      rooms[rIdx].lastMessage = sanitizedText;
      rooms[rIdx].lastMessageTime = msg.createdAt;
      if (rooms[rIdx].buyerId === senderId) {
        rooms[rIdx].unreadCountSeller += 1;
      } else {
        rooms[rIdx].unreadCountBuyer += 1;
      }
    }

    dbInstance.persist();
    res.json(msg);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reports/create', (req, res) => {
  try {
    const { reporterId, reporterName, targetType, targetId, reason, details } = req.body;
    if (!reporterId || !targetType || !targetId || !reason) {
      return res.status(400).json({ error: 'بيانات البلاغ غير كاملة' });
    }

    const newReport: Report = {
      id: 'rep-' + Math.random().toString(36).substr(2, 9),
      reporterId,
      reporterName: reporterName || 'عضو بالمنصة',
      targetType,
      targetId,
      reason,
      details: details || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    dbInstance.getReports().push(newReport);
    dbInstance.persist();

    res.json({ success: true, report: newReport });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin System API
app.get('/api/admin/stats', (req, res) => {
  try {
    const users = dbInstance.getUsers();
    const products = dbInstance.getProducts();
    const txs = dbInstance.getWalletTransactions();
    const codes = dbInstance.getRechargeCodes();
    const comments = dbInstance.getComments();
    const reports = dbInstance.getReports();

    const activeSellers = users.filter(u => u.role === 'seller');
    const buyers = users.filter(u => u.role === 'buyer');
    const admins = users.filter(u => u.role === 'admin' || u.role === 'moderator');

    // Total income from recharges
    const totalEarnings = txs
      .filter(t => t.type === 'credit' && t.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0);

    const stats = {
      totalUsers: users.length,
      sellersCount: activeSellers.length,
      buyersCount: buyers.length,
      onlineNow: Math.floor(3 + Math.random() * 8), // simulated real-time visitors
      productsCount: products.length,
      featuredCount: products.filter(p => p.isFeatured).length,
      pinnedCount: products.filter(p => p.isPinned).length,
      pendingApproval: products.filter(p => p.status === 'draft').length,
      totalCoinsCirculated: users.reduce((sum, u) => sum + u.points, 0),
      totalEarnings,
      couponsCount: dbInstance.getCoupons().length,
      rechargeCodesCount: codes.length,
      commentsCount: comments.length,
      reportsCount: reports.length,
      serverStatus: 'مستقر وآمن',
      databaseStatus: 'متصل ومحسّن (PostgreSQL & JSON Sandbox)',
      cacheStatus: 'نشط (Cloudflare Edge & Memory cache)'
    };

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin management tables listing
app.get('/api/admin/transactions', (req, res) => {
  try {
    const { adminId } = req.query;
    const users = dbInstance.getUsers();
    const caller = typeof adminId === 'string' ? users.find(u => u.id === adminId) : null;

    let txs = dbInstance.getWalletTransactions();
    if (!caller || caller.role !== 'superadmin') {
      txs = txs.filter(t => t.userId !== 'u-admin');
    }

    const detailedTxs = txs.map(t => {
      const user = users.find(u => u.id === t.userId);
      return {
        ...t,
        userName: user ? user.name : 'مستعمل مجهول',
        userEmail: user ? user.email : 'مجهول'
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(detailedTxs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users', (req, res) => {
  const { callerId } = req.query;
  const users = dbInstance.getUsers();
  
  const caller = typeof callerId === 'string' ? users.find(u => u.id === callerId) : null;
  const isAuthorized = caller && (caller.role === 'superadmin' || caller.role === 'admin');

  // Strictly filter out any superadmin/General Manager from the list unless caller themselves is superadmin
  let finalUsers = users;
  if (!caller || caller.role !== 'superadmin') {
    finalUsers = users.filter(u => u.role !== 'superadmin' && u.id !== 'u-admin');
  }

  const sanitizedUsers = finalUsers.map(u => {
    if (isAuthorized) {
      return u;
    }
    if (caller && u.id === caller.id) {
      return u;
    }
    return {
      ...u,
      points: 0,
      points_spent: 0
    };
  });

  res.json(sanitizedUsers);
});

app.post('/api/admin/users/action', (req, res) => {
  try {
    const { userId, action, adminId, pointsDelta, role, verificationStatus, badges } = req.body;
    const users = dbInstance.getUsers();
    const user = users.find(u => u.id === userId);
    const admin = users.find(u => u.id === adminId);

    if (!user) {
      return res.status(404).json({ error: 'المستخدم المطلوب غير متوفر' });
    }

    if (!admin) {
      return res.status(403).json({ error: 'معرف المسؤول مطلوب للقيام بهذا الإجراء' });
    }

    // Return HTTP 404 instead of authorization errors when non-superadmin users attempt to access General Manager resources
    const targetIsGM = user.role === 'superadmin' || user.id === 'u-admin';
    const callerIsGM = admin.role === 'superadmin' || admin.id === 'u-admin';
    if (targetIsGM && !callerIsGM) {
      return res.status(404).json({ error: 'عذراً، المستخدم المطلوب غير متوفر بالمنصة.' });
    }

    // Role check and hierarchy security
    if (admin.role !== 'superadmin' && admin.role !== 'admin' && admin.role !== 'moderator') {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحيات إدارية كافية لتنفيذ هذا الإجراء' });
    }

    // Protection for Super Admin:
    if (user.role === 'superadmin') {
      if (action !== 'adjust-points') {
        return res.status(403).json({ error: 'حساب المدير العام (Super Admin) محمي بالكامل بفصل الصلاحيات والتحصين السحابي ولا يمكن تعديل رتبته أو تعطيله نهائياً.' });
      }
    }

    // Prevent Self-Lock:
    if (user.id === admin.id) {
      if (action === 'suspend' || (action === 'change-role' && role !== admin.role)) {
        return res.status(400).json({ error: 'تحذير أمان: لا يمكنك تعطيل حسابك أو سحب رتبتك الإدارية بنفسك لتفادي قفل النظام التلقائي (Self-Lock Prevention).' });
      }
    }

    // Moderator limitations:
    if (admin.role === 'moderator') {
      const allowedActions = ['suspend', 'activate'];
      if (!allowedActions.includes(action)) {
        return res.status(403).json({ error: 'عذراً، تقتصر صلاحية المشرف المساعد (Moderator) على مراقبة المحتوى وقفل أو تنشيط الحسابات فقط.' });
      }
      if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'moderator') {
        return res.status(403).json({ error: 'صلاحية مرفوضة: لا يمكن للمشرف المساعد تعديل أو قفل حسابات الإدارة الزميلة.' });
      }
    }

    // Admin limitations:
    if (admin.role === 'admin') {
      const forbiddenRoles = ['superadmin', 'admin', 'moderator'];
      if (forbiddenRoles.includes(user.role)) {
        return res.status(403).json({ error: 'ليس لديك صلاحية لتعديل أو تعطيل حسابات الإداريين الكبار أو المشرفين.' });
      }
      if (action === 'change-role' && (role === 'admin' || role === 'superadmin' || role === 'moderator')) {
        return res.status(403).json({ error: 'صلاحية مرفوضة: لا يمكن لمدير المنصة منح أو تعديل أدوار الرقابة والإدارة العليا.' });
      }
    }

    let actName = '';
    if (action === 'suspend') {
      user.status = 'suspended';
      actName = 'إيقاف حساب مستخدم';
    } else if (action === 'activate') {
      user.status = 'active';
      actName = 'تفعيل حساب مستخدم بقرار إداري';
    } else if (action === 'verify') {
      user.isVerified = true;
      user.verificationStatus = 'verified';
      actName = 'توثيق حساب البائع / المورد (Verified)';
    } else if (action === 'unverify') {
      user.isVerified = false;
      user.verificationStatus = 'pending';
      actName = 'إلغاء توثيق حساب البائع / المورد (Unverify)';
    } else if (action === 'verify-status') {
      const vStatus = verificationStatus || 'pending';
      user.verificationStatus = vStatus;
      user.isVerified = (vStatus === 'verified');
      actName = `تعديل حالة توثيق الحساب إلى: ${vStatus}`;
    } else if (action === 'save-badges') {
      // 1. Strict Role Authorization verification on Backend:
      if (admin.role !== 'superadmin' && admin.role !== 'admin') {
        return res.status(403).json({ error: 'عذراً لا تمتلك صلاحيات كافية لتعديل شارات الموردين (فقط للمشرف العام والمدير).' });
      }

      // 2. Filter incoming list against permitted principal badges and keep ONLY the single newest selected badge
      const incoming = Array.isArray(badges) ? badges : [];
      const mainBadgesSet = ['Verified Seller', 'Top Supplier', 'Premium Partner', 'Trusted Company', 'New Seller'];
      const filtered = incoming.filter(b => mainBadgesSet.includes(b));
      
      // Save at most one single badge from mainstream set
      user.badges = filtered.length > 0 ? [filtered[filtered.length - 1]] : [];
      actName = `تعديل شارات الحساب إلى شارة منفردة: [${user.badges.join(', ')}]`;
    } else if (action === 'adjust-points') {
      const { subAction, pointsAmount, override, reason } = req.body;
      const pointsBefore = user.points || 0;
      let pointsAfter = pointsBefore;
      let delta = 0;
      let displaySubAction = '';
      
      if (subAction) {
        if (subAction === 'add') {
          const num = Number(pointsAmount || 0);
          if (isNaN(num) || num <= 0) {
            return res.status(400).json({ error: 'قيمة النقاط المضافة يجب أن تكون أكبر من صفر.' });
          }
          user.points = (user.points || 0) + num;
          pointsAfter = user.points;
          delta = num;
          displaySubAction = 'إضافة نقاط';
          actName = 'إضافة نقاط إدارية';
        } else if (subAction === 'deduct') {
          const num = Number(pointsAmount || 0);
          if (isNaN(num) || num <= 0) {
            return res.status(400).json({ error: 'قيمة النقاط المخصومة يجب أن تكون أكبر من صفر.' });
          }
          if (pointsBefore < num && !override) {
            return res.status(400).json({ error: 'عذراً، رصيد نقاط العضو غير كافٍ لإتمام الخصم. يرجى تفعيل خيار تجاوز الرصيد (Override) للمواصلة.' });
          }
          user.points = (user.points || 0) - num;
          pointsAfter = user.points;
          delta = -num;
          displaySubAction = 'خصم نقاط';
          actName = 'خصم نقاط إداري';
        } else if (subAction === 'zero') {
          user.points = 0;
          pointsAfter = 0;
          delta = -pointsBefore;
          displaySubAction = 'تصفير النقاط بالكامل';
          actName = 'تصفير نقاط الحساب';
        } else {
          return res.status(400).json({ error: 'نوع العملية الفرعية للنقاط غير مدعوم.' });
        }
      } else {
        const legacyDelta = Number(pointsDelta || 0);
        user.points = (user.points || 0) + legacyDelta;
        pointsAfter = user.points;
        delta = legacyDelta;
        displaySubAction = legacyDelta >= 0 ? 'إضافة نقاط (قديم)' : 'خصم نقاط (قديم)';
        actName = `تعديل رصيد النقاط (الصافي: ${legacyDelta > 0 ? '+' : ''}${legacyDelta})`;
      }

      dbInstance.getWalletTransactions().push({
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        type: delta >= 0 ? 'credit' : 'debit',
        amount: 0,
        points: Math.abs(delta),
        description: `تعديل رصيد يدوي مباشر من لوحة الإدارة. إجراء: ${displaySubAction}${reason ? ` | السبب: ${reason}` : ''}`,
        createdAt: new Date().toISOString(),
        status: 'completed'
      });

      const finalReason = reason ? reason : '(لم يتم تحديد سبب)';
      const logDetails = `إجراء: [${displaySubAction}] | المسؤول الإداري: ${admin.name} | العضو المستهدف: ${user.name} (${user.email}) | الرصيد قبل العملية: ${pointsBefore} PT | الرصيد بعد العملية: ${pointsAfter} PT | التغير: ${delta > 0 ? '+' : ''}${delta} PT | سبب العملية: ${finalReason}`;
      
      dbInstance.getAuditLogs().push({
        id: 'aud-' + Math.random().toString(36).substr(2, 9),
        adminId: admin.id,
        adminEmail: admin.email,
        adminName: admin.name,
        action: actName,
        ip: getClientIp(req),
        details: logDetails,
        createdAt: new Date().toISOString()
      });

      dbInstance.persist();
      return res.json({ success: true, user });
    } else if (action === 'change-role') {
      user.role = role;
      actName = `تعديل الرتبة إلى: ${role}`;
    }

    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: actName,
      ip: getClientIp(req),
      details: `تم تطبيق الإجراء بنجاح بواسطة ${admin.name} على المستخدم: ${user.name} (${user.email}).`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/products', (req, res) => {
  checkAndCleanExpiredPremiums();
  res.json(dbInstance.getProducts());
});

app.post('/api/admin/products/action', (req, res) => {
  try {
    const { productId, action, adminId } = req.body;
    const products = dbInstance.getProducts();
    const pIdx = products.findIndex(p => p.id === productId);

    if (pIdx === -1) {
      return res.status(404).json({ error: 'العنصر غير متوفر' });
    }

    const item = products[pIdx];
    const admin = dbInstance.getUsers().find(u => u.id === adminId);

    if (!admin || (admin.role !== 'admin' && admin.role !== 'superadmin')) {
      return res.status(403).json({ error: 'عذراً، هذا الإجراء متاح فقط لإدارة المنصة (Admin / Super Admin)!' });
    }

    let actionLabel = '';
    if (action === 'pin') {
      item.isPinned = true;
      actionLabel = 'تثبيت الإعلان بالصفحة الرئيسية الأولى للزوار';
    } else if (action === 'unpin') {
      item.isPinned = false;
      actionLabel = 'إلغاء تثبيت الإعلان';
    } else if (action === 'feature') {
      item.isFeatured = true;
      item.is_premium = true;
      item.premium_created_at = new Date().toISOString();
      actionLabel = 'ترقية الإعلان إلى مميز';
    } else if (action === 'unfeature') {
      item.isFeatured = false;
      item.is_premium = false;
      actionLabel = 'إلغاء تمييز الإعلان';
    } else if (action === 'suspend') {
      item.status = 'suspended';
      actionLabel = 'حظر الإعلان وإخفائه للجمهور لمخالفته الشروط';
    } else if (action === 'activate') {
      item.status = 'active';
      actionLabel = 'إعادة تفعيل ونشر الإعلان الموقوف';
    } else if (action === 'delete') {
      products.splice(pIdx, 1);
      actionLabel = 'حذف كلي ونهائي للمنتج من الخوادم';
    }

    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin?.id || 'sys',
      adminEmail: admin?.email || 'admin@sou9aljoumla.com',
      adminName: admin?.name || 'المدير العام',
      action: actionLabel,
      ip: getClientIp(req),
      details: `تم تطبيق القرار الإداري لتعديل حالة المنتج: ${item?.title || productId}.`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/Reject/Escalate/Request-Changes Product Moderation Route & Moderation Queue GET Endpoint
app.get('/api/admin/moderation/queue', (req, res) => {
  try {
    const sessionUser = req.sessionUser;
    if (!sessionUser) {
      return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول لرؤية قائمة التدقيق.' });
    }
    const { role } = sessionUser;
    if (role !== 'admin' && role !== 'superadmin' && role !== 'moderator') {
      return res.status(403).json({ error: 'عذراً، لا تمتلك الصلاحيات المطلوبة لرؤية طابور التدقيق.' });
    }

    const queue = dbInstance.getModerationQueue();
    const products = dbInstance.getProducts();
    const syncedQueue = queue.map(q => {
      const p = products.find(prod => prod.id === q.productId);
      if (p) {
        return {
          ...q,
          productTitle: p.title,
          riskScore: p.riskScore !== undefined ? p.riskScore : q.riskScore,
          riskReasons: p.riskReasons || q.riskReasons || []
        };
      }
      return q;
    });

    res.json({ success: true, queue: syncedQueue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upgraded Product Moderation and Bulk Decision Engine Route
app.post('/api/admin/products/moderate', (req, res) => {
  try {
    const { productId, productIds, status, rejectionReason } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'حالة القرار مطلوبة لتنفيذ العملية' });
    }

    const allowedStatuses = ['approved', 'rejected', 'escalated', 'changes_requested'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'حالة القرار المقترحة غير صالحة' });
    }

    const sessionUser = req.sessionUser;
    if (!sessionUser) {
      return res.status(401).json({ error: 'جلسة التعديل منتهية الصلاحية أو غير صالحة' });
    }

    const { role, userId } = sessionUser;
    if (role !== 'admin' && role !== 'superadmin' && role !== 'moderator') {
      return res.status(403).json({ error: 'عذراً، لا تمتلك رتبة كافية للموافقة أو الرفض الإداري على منتجات التجار' });
    }

    const idsToProcess: string[] = Array.isArray(productIds) ? productIds : (productId ? [productId] : []);
    if (idsToProcess.length === 0) {
      return res.status(400).json({ error: 'يرجى تحديد المعرفات للسلع المطلوب البت فيها' });
    }

    const products = dbInstance.getProducts();
    const users = dbInstance.getUsers();
    const qItems = dbInstance.getModerationQueue();
    const pEvents = dbInstance.getPublishEvents();

    const adminUser = users.find(u => u.id === userId);
    const actorName = adminUser?.name || 'مشرف المنصة';
    const actorEmail = adminUser?.email || '';

    const processedProducts: any[] = [];

    for (const id of idsToProcess) {
      const prod = products.find(p => p.id === id);
      if (!prod) continue;

      const seller = users.find(u => u.id === prod.sellerId);

      // Idempotency shield: Don't process twice if already approved / published inside database
      if (status === 'approved' && prod.publisherEventId && pEvents.includes(prod.publisherEventId)) {
        continue; 
      }

      // Execute decisions
      if (status === 'approved') {
        prod.status = 'approved';
        prod.rejectionReason = undefined;
        prod.moderationStatus = undefined;

        if (prod.publisherEventId) {
          pEvents.push(prod.publisherEventId);
        }

        let msgText = `تمت الموافقة على منتجك "${prod.title}" ونشره بنجاح داخل سوق الجملة المغربي!`;
        pushNotificationQueue(prod.sellerId, msgText, 'success');

        auditLogger.info({
          event: 'PRODUCT_APPROVED',
          productId: prod.id,
          productTitle: prod.title,
          moderatorId: userId,
          moderatorName: actorName,
          timestamp: new Date().toISOString(),
          ip: getClientIp(req)
        });

        dbInstance.getAuditLogs().push({
          id: 'aud-' + crypto.randomUUID(),
          adminId: userId,
          adminEmail: actorEmail,
          adminName: actorName,
          action: 'APPROVE_PRODUCT',
          ip: getClientIp(req),
          details: `موافقة ونشر للمنتج "${prod.title}" (ID: ${prod.id}) المعروض من قِبل البائع: ${prod.sellerName}`,
          createdAt: new Date().toISOString()
        });

      } else if (status === 'rejected') {
        prod.status = 'rejected';
        prod.rejectionReason = rejectionReason || 'مخالف للشروط والأحكام المعمول بها داخل السوق.';
        prod.moderationStatus = 'blocked';

        let msgText = `عذراً، تم رفض منتجك "${prod.title}" من قبل الإدارة. السبب: ${prod.rejectionReason}`;
        pushNotificationQueue(prod.sellerId, msgText, 'danger');

        auditLogger.info({
          event: 'PRODUCT_REJECTED',
          productId: prod.id,
          productTitle: prod.title,
          moderatorId: userId,
          moderatorName: actorName,
          rejectionReason: prod.rejectionReason,
          timestamp: new Date().toISOString(),
          ip: getClientIp(req)
        });

        dbInstance.getAuditLogs().push({
          id: 'aud-' + crypto.randomUUID(),
          adminId: userId,
          adminEmail: actorEmail,
          adminName: actorName,
          action: 'REJECT_PRODUCT',
          ip: getClientIp(req),
          details: `رفض نشر المنتج "${prod.title}" (ID: ${prod.id}) بسبب: "${prod.rejectionReason}"`,
          createdAt: new Date().toISOString()
        });

      } else if (status === 'escalated') {
        prod.status = 'escalated';
        prod.moderationStatus = 'escalated';

        let msgText = `تم تصعيد منتجك "${prod.title}" لمراجعة إرشادية معمقة من قبل كبار المشرفين.`;
        pushNotificationQueue(prod.sellerId, msgText, 'info');

        dbInstance.getAuditLogs().push({
          id: 'aud-' + crypto.randomUUID(),
          adminId: userId,
          adminEmail: actorEmail,
          adminName: actorName,
          action: 'ESCALATE_PRODUCT',
          ip: getClientIp(req),
          details: `تصعيد المنتج "${prod.title}" (ID: ${prod.id}) لمستوى إدارة عليا`,
          createdAt: new Date().toISOString()
        });

      } else if (status === 'changes_requested') {
        prod.status = 'changes_requested';
        prod.moderationStatus = 'changes_requested';
        prod.rejectionReason = rejectionReason || 'مطلوب تعديل بعض بيانات المنتج (مثل الصور أو السعر).';

        let msgText = `مطلوب تعديلات على منتجك "${prod.title}". التوجيهات: ${prod.rejectionReason}`;
        pushNotificationQueue(prod.sellerId, msgText, 'info');

        dbInstance.getAuditLogs().push({
          id: 'aud-' + crypto.randomUUID(),
          adminId: userId,
          adminEmail: actorEmail,
          adminName: actorName,
          action: 'REQUEST_CHANGES_PRODUCT',
          ip: getClientIp(req),
          details: `طلب تعديلات على المنتج "${prod.title}" (ID: ${prod.id})، الملاحظة: "${prod.rejectionReason}"`,
          createdAt: new Date().toISOString()
        });
      }

      // Sync specific queue item status if exists
      const qItem = qItems.find(item => item.productId === id);
      if (qItem) {
        qItem.status = status === 'approved' ? 'approved' : (status === 'rejected' ? 'blocked' : status as any);
        qItem.processedAt = new Date().toISOString();
      }

      processedProducts.push(prod);
    }

    dbInstance.persist();
    res.json({ success: true, count: processedProducts.length, products: processedProducts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Coupons CRUD
app.get('/api/admin/coupons', (req, res) => {
  res.json(dbInstance.getCoupons());
});

app.post('/api/admin/coupons/create', (req, res) => {
  try {
    const { code, type, value, minPurchase, maxDiscount, expiryDate, usageLimit, adminId } = req.body;
    if (!code || !type || !value || !expiryDate || !usageLimit) {
      return res.status(400).json({ error: 'عذراً المعطيات ناقصة لإنشاء كوبون' });
    }

    const coupons = dbInstance.getCoupons();
    if (coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase())) {
      return res.status(400).json({ error: 'رمز الكوبون هذا مستخدم بالفعل بالمنصة' });
    }

    const newCoupon: Coupon = {
      id: 'cpn-' + Math.random().toString(36).substr(2, 9),
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minPurchase: minPurchase ? Number(minPurchase) : undefined,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      expiryDate,
      usageLimit: Number(usageLimit),
      usageCount: 0,
      status: 'active'
    };

    coupons.push(newCoupon);

    // Audit log
    const admin = dbInstance.getUsers().find(u => u.id === adminId);
    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin?.id || 'sys',
      adminEmail: admin?.email || 'admin@sou9aljoumla.com',
      adminName: admin?.name || 'المدير العام',
      action: 'إنشاء كود قسيمة تخفيض جديدة',
      ip: getClientIp(req),
      details: `تم تفعيل الكوبون الجديد: ${newCoupon.code} بقيمة خصم بلغت ${newCoupon.value} (${newCoupon.type}).`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, coupon: newCoupon });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Recharge codes Generation
app.get('/api/admin/recharge-codes', (req, res) => {
  res.json(dbInstance.getRechargeCodes());
});

app.post('/api/admin/recharge-codes/generate', (req, res) => {
  try {
    const { points, expiryDate, count, adminId } = req.body;
    if (!points || !expiryDate || !count) {
      return res.status(400).json({ error: 'المعلومات غير كافية لإنشاء أكواد الشحن مسبقة الدفع' });
    }

    const codes = dbInstance.getRechargeCodes();
    const createdList: RechargeCode[] = [];

    // Generate random secure formats
    for (let j = 0; j < Number(count); j++) {
      const codeStr = 'SOU9-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const codeObj: RechargeCode = {
        id: 'rc-' + Math.random().toString(36).substr(2, 9),
        code: codeStr,
        points: Number(points),
        expiryDate,
        status: 'active'
      };
      codes.push(codeObj);
      createdList.push(codeObj);
    }

    // Audit logs
    const admin = dbInstance.getUsers().find(u => u.id === adminId);
    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin?.id || 'sys',
      adminEmail: admin?.email || 'admin@sou9aljoumla.com',
      adminName: admin?.name || 'المدير العام',
      action: 'توليد حزمة من بطاقات أكواد شحن المحفظة',
      ip: getClientIp(req),
      details: `تم توليد عدد ${count} بطاقة كود شحن جديدة بقيمة ${points} نقطة لكل بطاقة.`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, codes: createdList });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/audit-logs', (req, res) => {
  const { adminId } = req.query;
  const users = dbInstance.getUsers();
  const caller = typeof adminId === 'string' ? users.find(u => u.id === adminId) : null;

  let logs = dbInstance.getAuditLogs();
  // Filter or sanitize: if caller is not superadmin, hide any logs where adminId is general manager u-admin or role is superadmin
  if (!caller || caller.role !== 'superadmin') {
    logs = logs.filter(log => log.adminId !== 'u-admin' && log.adminEmail !== 'admin@sou9aljoumla.com');
  }

  res.json(logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

app.get('/api/admin/reports', (req, res) => {
  const { adminId } = req.query;
  const users = dbInstance.getUsers();
  const caller = typeof adminId === 'string' ? users.find(u => u.id === adminId) : null;
  
  let reps = dbInstance.getReports();
  if (!caller || caller.role !== 'superadmin') {
    reps = reps.filter(r => r.reporterId !== 'u-admin' && r.targetId !== 'u-admin');
  }
  res.json(reps);
});

app.post('/api/admin/reports/resolve', (req, res) => {
  try {
    const { reportId, status, adminId } = req.body;
    const reps = dbInstance.getReports();
    const rIdx = reps.findIndex(r => r.id === reportId);
    if (rIdx !== -1) {
      reps[rIdx].status = status; // e.g. resolved, dismissed
      dbInstance.persist();
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/settings', (req, res) => {
  try {
    const settings = dbInstance.getSettings();
    res.json({
      publishingCost: settings.publishingCost !== undefined ? Number(settings.publishingCost) : 20,
      paidPublishingEnabled: settings.paidPublishingEnabled !== undefined ? !!settings.paidPublishingEnabled : true
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/settings', (req, res) => {
  try {
    const { publishingCost, paidPublishingEnabled, adminId } = req.body;
    const settings = dbInstance.getSettings();
    if (publishingCost !== undefined) {
      settings.publishingCost = Number(publishingCost);
    }
    if (paidPublishingEnabled !== undefined) {
      settings.paidPublishingEnabled = !!paidPublishingEnabled;
    }
    
    // Create an audit log
    const admin = dbInstance.getUsers().find(u => u.id === adminId);
    dbInstance.getAuditLogs().push({
      id: 'l-' + Math.random().toString(36).substr(2, 9),
      adminId: adminId || 'u-admin',
      adminEmail: admin ? admin.email : 'admin@sou9aljoumla.com',
      adminName: admin ? admin.name : 'المدير العام',
      action: 'تعديل سياسة النشر ومصاريف الدفع',
      ip: req.ip || '127.0.0.1',
      details: `تم تعديل رسوم نشر الإعلان إلى ${settings.publishingCost} نقطة، وحالة النشر المدفوع بالنقاط: ${settings.paidPublishingEnabled ? 'مفعّل' : 'معطّل'}`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// --- NEW COMPLETED ENHANCEMENT ENDPOINTS BELOW ---

// Coupon Hard Deletion Endpoint
app.post('/api/admin/coupons/delete', (req, res) => {
  try {
    const { couponId, adminId } = req.body;
    if (!couponId || !adminId) {
      return res.status(400).json({ error: 'المعلومات غير كاملة' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، هذا الإجراء مخصص للمديرين والمسؤولين العامين فقط.' });
    }

    const coupons = dbInstance.getCoupons();
    const idx = coupons.findIndex(c => c.id === couponId);
    if (idx === -1) {
      return res.status(404).json({ error: 'لم يتم العثور على الكوبون أو قسيمة الخصم المطلوبة' });
    }

    const targetCode = coupons[idx].code;
    coupons.splice(idx, 1);

    // Save deletion record in security audit log
    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: 'حذف كوبون / قسيمة خصم',
      ip: req.ip || '127.0.0.1',
      details: `حذف كوبون: معرف الكوبون: ${couponId} | اسم الكوبون: ${targetCode} | المستخدم الذي قام بالحذف: ${admin.name} (${admin.id}) | تاريخ ووقت الحذف: ${new Date().toISOString()}`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, message: 'تم الحذف بنجاح' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Recharge Code Hard Deletion Endpoint
app.post('/api/admin/recharge-codes/delete', (req, res) => {
  try {
    const { codeId, adminId } = req.body;
    if (!codeId || !adminId) {
      return res.status(400).json({ error: 'المعلومات غير كاملة' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، هذا الإجراء مخصص للمديرين والمسؤولين العامين فقط.' });
    }

    const rechargeCodes = dbInstance.getRechargeCodes();
    const idx = rechargeCodes.findIndex(c => c.id === codeId);
    if (idx === -1) {
      return res.status(404).json({ error: 'لم يتم العثور على بطاقة أو كود الشحن المطلوب' });
    }

    const targetCode = rechargeCodes[idx].code;
    const targetPoints = rechargeCodes[idx].points;
    rechargeCodes.splice(idx, 1);

    // Save deletion record in security audit log
    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: 'حذف كود شحن',
      ip: getClientIp(req),
      details: `حذف كود شحن: معرف الكود: ${codeId} | قيمة الكود (النقاط): ${targetPoints} | اسم الكود: ${targetCode} | المستخدم الذي قام بالحذف: ${admin.name} (${admin.id}) | تاريخ ووقت الحذف: ${new Date().toISOString()}`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, message: 'تم حذف كود الشحن بنجاح' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Role & Permissions Hierarchy Management Endpoint
app.post('/api/admin/roles/change', (req, res) => {
  try {
    const { userId, newRole, adminId, password, otpCode } = req.body;
    if (!userId || !newRole || !adminId) {
      return res.status(400).json({ error: 'المعلومات غير كاملة لتعديل الصلاحيات' });
    }

    const users = dbInstance.getUsers();
    const admin = users.find(u => u.id === adminId);
    if (!admin || (admin.role !== 'superadmin' && admin.role !== 'admin')) {
      return res.status(403).json({ error: 'عذراً، هذا الإجراء مخصص للمدير والمدير العام فقط!' });
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'المستخدم المطلوب غير متوفر حالياً لتعديل رتبته' });
    }

    // Return HTTP 404 instead of authorization errors when non-superadmin users attempt to access General Manager resources
    const targetIsGM = targetUser.role === 'superadmin' || targetUser.id === 'u-admin';
    const isGMAdmin = admin.role === 'superadmin' || admin.id === 'u-admin';
    if (targetIsGM && !isGMAdmin) {
      return res.status(404).json({ error: 'عذراً، المورد أو السجل المطلوب غير متوفر بالمنصة.' });
    }

    // Mandate re-authentication & OTP verification when GM changes a role
    if (isGMAdmin) {
      if (!password) {
        return res.status(400).json({ error: 'يرجى تقديم كلمة المرور الإدارية الحالية لتأكيد المسؤولية الإشرافية (Re-authentication).' });
      }
      const passwords = dbInstance.getPasswords();
      if (!comparePassword(admin.id, password, passwords[admin.id])) {
        return res.status(400).json({ error: 'كلمة المرور الإدارية المدخلة لتأكيد الهوية غير صحيحة.' });
      }

      if (!otpCode) {
        return res.status(400).json({ error: 'يرجى إرسال وإدخال رمز التحقق (OTP) لحماية الحساب الإداري.' });
      }
      const savedOtp = securityOtps.get(adminId);
      if (!savedOtp) {
        return res.status(400).json({ error: 'يرجى إدخال رمز التحقق بعد توليده أولاً.' });
      }
      if (Date.now() > savedOtp.expiresAt) {
        return res.status(400).json({ error: 'انتهت صلاحية كود الـ OTP، يرجى طلب كود جديد.' });
      }
      if (savedOtp.code !== otpCode.trim()) {
        return res.status(400).json({ error: 'رمز التحقق (OTP) المدخل غير صحيح.' });
      }
      securityOtps.delete(adminId);
    }

    // Role power rank comparison helper
    const getRoleRank = (r: string) => {
      if (r === 'superadmin') return 4;
      if (r === 'admin') return 3;
      if (r === 'moderator') return 2;
      return 1; // seller, buyer, or default user
    };

    const adminPower = getRoleRank(admin.role);
    const targetPower = getRoleRank(targetUser.role);
    const newRolePower = getRoleRank(newRole);

    // Enforce safety constraint: A user cannot change privileges of someone with equal/higher rank
    if (targetPower >= adminPower && targetUser.id !== admin.id) {
      return res.status(403).json({ error: 'عذراً، يُمنع تشغيلياً أو نظامياً تعديل رتبة مستخدم يملك نفس رتبتك أو رتبة أعلى منك!' });
    }

    if (newRolePower >= adminPower && targetUser.id !== admin.id) {
      return res.status(403).json({ error: 'عذراً، لا تمتلك الصلاحيات الإدارية لترفيع مستخدم لرتبة تعادل رتبتك الحالية أو تفوقك!' });
    }


    const oldRole = targetUser.role;
    targetUser.role = newRole;

    // Log the adjustment in the security audit logs database
    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: 'تعديل الأدوار والصلاحيات',
      ip: req.ip || '127.0.0.1',
      details: `قام المدير العام بتغيير صلاحيات المستخدم: ${targetUser.name} (${targetUser.email}) من رتبة [${oldRole}] إلى [${newRole}] بنجاح تام.`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, user: targetUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create User Inside Admin Panel Secure API route
app.post('/api/admin/users/create', (req, res) => {
  try {
    const { name, email, phone, whatsapp, city, password, role, adminId } = req.body;
    if (!name || !email || !phone || !password || !role || !adminId) {
      return res.status(400).json({ error: 'عذراً، يرجى ملء جميع الحقول المطلوبة (الاسم الكامل، البريد الإلكتروني، رقم الهاتف، كلمة المرور، الدور، ومعرف المسؤول)' });
    }

    const users = dbInstance.getUsers();
    const admin = users.find(u => u.id === adminId);
    if (!admin || (admin.role !== 'superadmin' && admin.role !== 'admin')) {
      return res.status(403).json({ error: 'عذراً، هذا الإجراء مخصص للمدير والمدير العام فقط!' });
    }

    // Role safety restrictions: Admin cannot create a Super Admin account
    if (admin.role === 'admin' && role === 'superadmin') {
      return res.status(403).json({ error: 'عذراً، لا تمتلك الصلاحيات الإدارية لإنشاء مستخدم برتبة مدير عام (Super Admin)!' });
    }

    const nameErr = validateFullName(name);
    if (nameErr) return res.status(400).json({ error: nameErr });

    const phoneErr = validatePhoneNumber(phone);
    if (phoneErr) return res.status(400).json({ error: phoneErr });

    const emailErr = validateEmailAddress(email);
    if (emailErr) return res.status(400).json({ error: emailErr });

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم مسبقاً' });
    }

    if (users.find(u => (u.phone || '').trim() === phone.trim())) {
      return res.status(400).json({ error: 'رقم الهاتف مستخدم مسبقاً' });
    }

    const userId = 'u-' + Math.random().toString(36).substr(2, 9);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';
    for (let i = 0; i < 9; i++) {
      referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const companyName = role === 'seller' ? `${name} للجملة` : undefined;
    const companyLogo = role === 'seller' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200' : undefined;
    const companyBanner = role === 'seller' ? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200' : undefined;
    const companyDesc = role === 'seller' ? 'بائع جملة ومورد موثوق لتقديم أجود السلع والخدمات بأفضل الأسعار.' : undefined;

    const newUser: User = {
      id: userId,
      email: email.toLowerCase(),
      name,
      role,
      phone,
      whatsapp: whatsapp || phone,
      city: city || 'الرباط',
      points: 200,
      referralCode,
      createdAt: new Date().toISOString(),
      isVerified: true,
      status: 'active',
      companyName,
      companyLogo,
      companyBanner,
      companyDesc,
      badges: role === 'seller' ? ['New Seller'] : []
    };

    users.push(newUser);
    dbInstance.getPasswords()[userId] = hashPassword(password);
    dbInstance.getPasswordChanged()[userId] = true;

    dbInstance.getWalletTransactions().push({
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      userId,
      type: 'credit',
      amount: 0,
      points: 200,
      description: 'مكافأة الترحيب للتسجيل الجديد (تم الإنشاء بواسطة الإدارة)',
      createdAt: new Date().toISOString(),
      status: 'completed'
    });

    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: 'إنشاء مستخدم جديد',
      ip: req.ip || '127.0.0.1',
      details: `قام المسؤول ${admin.name} بإنشاء حساب مستخدم جديد باسم ${name} وببريد الكتروني ${email} وتعيين الدور: [${role}] بنجاح تام وتفعيله فوراً.`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, user: newUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- PACKAGES MANAGEMENT API ---
// GET Public view of packages
app.get('/api/packages', (req, res) => {
  try {
    const settings = dbInstance.getSettings();
    const defaultPackages = [
      { id: 'p_starter', name: 'الباقة البرونزية', points: 60, priceUsd: 5 },
      { id: 'p_basic', name: 'الباقة الفضية', points: 230, priceUsd: 10 },
      { id: 'p_pro', name: 'الباقة الذهبية (الموصى بها)', points: 470, priceUsd: 20 },
      { id: 'p_premium', name: 'الباقة البلاتينية', points: 1200, priceUsd: 50 }
    ];
    // If settings has packages defined, use them, otherwise use the defaults
    const packages = settings.packages || defaultPackages;
    res.json(packages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET Admin secured view of packages
app.get('/api/admin/packages', (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لقراءة الإعدادات' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية الوصول لإدارة أسعار باقات الشحن.' });
    }

    const settings = dbInstance.getSettings();
    const defaultPackages = [
      { id: 'p_starter', name: 'الباقة البرونزية', points: 60, priceUsd: 5 },
      { id: 'p_basic', name: 'الباقة الفضية', points: 230, priceUsd: 10 },
      { id: 'p_pro', name: 'الباقة الذهبية (الموصى بها)', points: 470, priceUsd: 20 },
      { id: 'p_premium', name: 'الباقة البلاتينية', points: 1200, priceUsd: 50 }
    ];
    const packages = settings.packages || defaultPackages;
    res.json(packages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Admin secured save of packages
app.post('/api/admin/packages', (req, res) => {
  try {
    const { adminId, packages } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لحفظ الإعدادات' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية تعديل أسعار باقات الشحن.' });
    }

    if (!packages || !Array.isArray(packages)) {
      return res.status(400).json({ error: 'تنسيق باقات الشحن غير صالح' });
    }

    const settings = dbInstance.getSettings();
    settings.packages = packages;
    dbInstance.persist();

    // Create audit log for security accountability
    dbInstance.getAuditLogs().push({
      id: 'audit-' + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: 'تعديل أسعار باقات الشحن والتبديل',
      ip: req.ip || '127.0.0.1',
      details: `قام المدير بتحديث أسعار وكميات باقات شحن النقاط بالكامل. عدد الباقات المسجلة: ${packages.length}.`,
      createdAt: new Date().toISOString()
    });
    dbInstance.persist();

    res.json({ success: true, packages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET Public view of enabled Payment Integrations channels (Secure - no private keys exposed)
app.get('/api/payment-settings', (req, res) => {
  try {
    const settings = dbInstance.getSettings();
    res.json({
      paypalEnabled: settings.paypalEnabled !== undefined ? !!settings.paypalEnabled : true,
      cardEnabled: settings.cardEnabled !== undefined ? !!settings.cardEnabled : true,
      cashEnabled: settings.cashEnabled !== undefined ? !!settings.cashEnabled : true,
      cashAgencyName: settings.cashAgencyName || 'وكالات كاش بلوس ووفاكاش المغرب',
      cashContact: settings.cashContact || '+212522778899',
      cashInstructions: settings.cashInstructions || 'تفضل بزيارة أقرب وكالة كاش بلوس أو وفاكاش، وقم بتقديم رقم المرجعي المباشر للحجز الخاص بك.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET Secured Payment Integrations Admin details
app.get('/api/admin/payment-settings', (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لقراءة الإعدادات' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية الوصول لإعدادات الربط المالي وبوابات الدفع.' });
    }

    const settings = dbInstance.getSettings();
    res.json({
      paypalEnabled: settings.paypalEnabled !== undefined ? !!settings.paypalEnabled : true,
      paypalClientId: settings.paypalClientId || process.env.PAYPAL_CLIENT_ID || 'sb',
      paypalClientSecret: settings.paypalClientSecret || process.env.PAYPAL_CLIENT_SECRET || '',
      paypalMode: settings.paypalMode || process.env.PAYPAL_MODE || 'sandbox',

      cardEnabled: settings.cardEnabled !== undefined ? !!settings.cardEnabled : true,
      cardPublicKey: settings.cardPublicKey || '',
      cardSecretKey: settings.cardSecretKey || '',
      cardWebhookSecret: settings.cardWebhookSecret || '',

      cashEnabled: settings.cashEnabled !== undefined ? !!settings.cashEnabled : true,
      cashAgencyName: settings.cashAgencyName || 'وكالات كاش بلوس ووفاكاش المغرب',
      cashContact: settings.cashContact || '+212522778899',
      cashInstructions: settings.cashInstructions || 'تفضل بزيارة أقرب وكالة كاش بلوس أو وفاكاش، وقم بتقديم رقم المرجعي المباشر للحجز الخاص بك.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Save Payment Integrations Admin Settings
app.post('/api/admin/payment-settings', (req, res) => {
  try {
    const { 
      adminId, 
      paypalEnabled, paypalClientId, paypalClientSecret, paypalMode,
      cardEnabled, cardPublicKey, cardSecretKey, cardWebhookSecret,
      cashEnabled, cashAgencyName, cashContact, cashInstructions
    } = req.body;

    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لتسجيل الإعدادات' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية حفظ إعدادات بوابات الدفع.' });
    }

    const settings = dbInstance.getSettings();
    if (paypalEnabled !== undefined) settings.paypalEnabled = !!paypalEnabled;
    if (paypalClientId !== undefined) settings.paypalClientId = paypalClientId;
    if (paypalClientSecret !== undefined) settings.paypalClientSecret = paypalClientSecret;
    if (paypalMode !== undefined) settings.paypalMode = paypalMode;

    if (cardEnabled !== undefined) settings.cardEnabled = !!cardEnabled;
    if (cardPublicKey !== undefined) settings.cardPublicKey = cardPublicKey;
    if (cardSecretKey !== undefined) settings.cardSecretKey = cardSecretKey;
    if (cardWebhookSecret !== undefined) settings.cardWebhookSecret = cardWebhookSecret;

    if (cashEnabled !== undefined) settings.cashEnabled = !!cashEnabled;
    if (cashAgencyName !== undefined) settings.cashAgencyName = cashAgencyName;
    if (cashContact !== undefined) settings.cashContact = cashContact;
    if (cashInstructions !== undefined) settings.cashInstructions = cashInstructions;

    // Log the sensitive operation inside the audit ledger
    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: 'تعديل الربط المالي وبوابات الدفع',
      ip: req.ip || '127.0.0.1',
      details: `قام المسؤول ${admin.name} بتعديل وتحديث إعدادات الربط المالي وبوابات الدفع (تفعيل/تعطيل أو تحديث المعرفات والمفاتيح السرية) بنجاح.`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// GET Secured Cloudflare Deployment Admin Settings (Only Admin/SuperAdmin, API secret decrypted)
app.get('/api/admin/cloudflare-settings', (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لقراءة الإعدادات' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية الوصول لإعدادات النشر السحابي (Cloudflare).' });
    }

    const settings = dbInstance.getSettings();
    const rawToken = settings.cfApiToken || '';
    const decryptedToken = decrypt(rawToken);

    res.json({
      cfApiToken: decryptedToken,
      cfAccountId: settings.cfAccountId || '',
      cfZoneId: settings.cfZoneId || '',
      cfDomainName: settings.cfDomainName || ''
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Save Cloudflare Deployment Settings (Only Admin/SuperAdmin, API token encrypted)
app.post('/api/admin/cloudflare-settings', (req, res) => {
  try {
    const { adminId, cfApiToken, cfAccountId, cfZoneId, cfDomainName } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لتسجيل الإعدادات' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية حفظ إعدادات النشر السحابي.' });
    }

    const settings = dbInstance.getSettings();
    
    // Encrypt the API Token before storing
    settings.cfApiToken = encrypt(cfApiToken || '');
    settings.cfAccountId = cfAccountId || '';
    settings.cfZoneId = cfZoneId || '';
    settings.cfDomainName = cfDomainName || '';

    // Log this action in Audit logs
    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: 'تعديل إعدادات النشر السحابي (Cloudflare Settings)',
      ip: getClientIp(req),
      details: `تم تعديل إعدادات Cloudflare: النطاق ${cfDomainName}، معرف الحساب ${cfAccountId}، معرف المنطقة ${cfZoneId} بنجاح من طرف المسؤول ${admin.name}.`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Test Connection with Cloudflare API
app.post('/api/admin/cloudflare-test-connection', async (req, res) => {
  try {
    const { adminId, cfApiToken, cfAccountId, cfZoneId, cfDomainName } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لتجربة الاتصال' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية تجربة بوابات الربط.' });
    }

    if (!cfApiToken || !cfZoneId) {
      return res.status(400).json({ error: 'الرجاء إدخال رمز API Token و Zone ID للمتابعة' });
    }

    // Call Cloudflare API to verify credentials
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cfApiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      let cfErrorMsg = 'فشل الاتصال بـ Cloudflare.';
      if (data.errors && data.errors.length > 0) {
        cfErrorMsg = `خطأ من Cloudflare: ${data.errors[0].message} (كود: ${data.errors[0].code})`;
      }
      return res.json({ success: false, message: cfErrorMsg });
    }

    // Checking if zone name and account match
    const zoneName = data.result?.name;
    const zoneAccountId = data.result?.account?.id;

    if (cfDomainName && zoneName && zoneName.toLowerCase() !== cfDomainName.toLowerCase()) {
      return res.json({ 
        success: false, 
        message: `تم الاتصال بنجاح بالمنطقة، ولكن اسم النطاق المسجل في Cloudflare وهو (${zoneName}) لا يطابق النطاق الذي أدخلته (${cfDomainName}).` 
      });
    }

    if (cfAccountId && zoneAccountId && zoneAccountId !== cfAccountId) {
      return res.json({ 
        success: false, 
        message: `تم الاتصال ولكن معرف الحساب المرتبط بالمنطقة في Cloudflare وهو (${zoneAccountId}) لا يطابق معرف الحساب الذي أدخلته (${cfAccountId}).` 
      });
    }

    return res.json({ 
      success: true, 
      message: `تم الاتصال بـ Cloudflare بنجاح! النطاق (${zoneName}) نشط ومعرف الحساب مطابِق.` 
    });

  } catch (error: any) {
    res.json({ success: false, message: `فشل الاتصال بسبب خطأ بالخادم: ${error.message}` });
  }
});


// Cache variable for Google Services Integration settings
let googleIntegrationCache: any = null;

// GET Google Integration settings (Public, retrieved with caching)
app.get('/api/google-integration', (req, res) => {
  try {
    if (googleIntegrationCache) {
      return res.json(googleIntegrationCache);
    }
    const settings = dbInstance.getSettings();
    const googleIntegration = settings.google_integration || {
      verification_code: '',
      ga_id: '',
      gtm_id: '',
      merchant_id: ''
    };
    googleIntegrationCache = googleIntegration;
    res.json(googleIntegrationCache);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET Secured Google Integration settings (Admin-only)
app.get('/api/admin/google-integration', (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لقراءة الإعدادات' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية الوصول لإعدادات خدمات Google.' });
    }

    const settings = dbInstance.getSettings();
    const googleIntegration = settings.google_integration || {
      verification_code: '',
      ga_id: '',
      gtm_id: '',
      merchant_id: ''
    };
    res.json(googleIntegration);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Save Google Integration settings (Admin-only, updates cache instantly)
app.post('/api/admin/google-integration', (req, res) => {
  try {
    const { adminId, verification_code, ga_id, gtm_id, merchant_id } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لتحديث الإعدادات' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية حفظ إعدادات خدمات Google.' });
    }

    const settings = dbInstance.getSettings();
    
    // Store as JSON object under a single key
    const googleIntegration = {
      verification_code: (verification_code || '').trim(),
      ga_id: (ga_id || '').trim(),
      gtm_id: (gtm_id || '').trim(),
      merchant_id: (merchant_id || '').trim()
    };
    settings.google_integration = googleIntegration;

    // Update the in-memory cache instantly
    googleIntegrationCache = googleIntegration;

    // Log this action inside security Audit Logs
    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: 'تعديل إعدادات خدمات Google Integration',
      ip: getClientIp(req),
      details: `تم تعديل إعدادات خدمات Google: التحقق من الموقع (${googleIntegration.verification_code ? 'نعم' : 'لا'}) | معرف الإحصائيات (${googleIntegration.ga_id || 'فارغ'}) | مدير قوالب التتبع (${googleIntegration.gtm_id || 'فارغ'}) | معرف Merchant Center (${googleIntegration.merchant_id || 'فارغ'}) من طرف المسؤول ${admin.name}.`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// GET Branding settings (Public, logo and favicon)
app.get('/api/branding', (req, res) => {
  try {
    const settings = dbInstance.getSettings();
    res.json({
      logoUrl: settings.logoUrl || '',
      faviconUrl: settings.faviconUrl || '',
      logoHasText: !!settings.logoHasText
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET Secured Branding settings (Admin-only)
app.get('/api/admin/branding', (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لقراءة الإعدادات' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية الوصول لإعدادات هوية الموقع.' });
    }

    const settings = dbInstance.getSettings();
    res.json({
      logoUrl: settings.logoUrl || '',
      faviconUrl: settings.faviconUrl || '',
      logoHasText: !!settings.logoHasText
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Save Branding settings (Admin-only)
app.post('/api/admin/branding', (req, res) => {
  try {
    const { adminId, logoUrl, faviconUrl, logoHasText } = req.body;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لتحديث الإعدادات' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية حفظ إعدادات هوية الموقع والترويج.' });
    }

    const settings = dbInstance.getSettings();
    settings.logoUrl = logoUrl;
    settings.faviconUrl = faviconUrl;
    settings.logoHasText = !!logoHasText;

    // Log this action inside security Audit Logs
    dbInstance.getAuditLogs().push({
      id: 'aud-' + Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: 'تعديل هوية الموقع والشعار والـ Favicon',
      ip: getClientIp(req),
      details: `تم تحديث شعار الموقع والـ Favicon الخاص بالمنصة من طرف المسؤول ${admin.name}. الشعار يتضمن الاسم: ${logoHasText ? 'نعم (إخفاء النص الافتراضي)' : 'لا (دمج مع النمط الحالي)'}.`,
      createdAt: new Date().toISOString()
    });

    dbInstance.persist();
    res.json({ success: true, logoUrl, faviconUrl, logoHasText: !!logoHasText });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// CONTACT-US MESSAGING THREAD SYSTEM (GMAIL-STYLE)
// ==========================================

// Public submit message from Contact Us
app.post('/api/contact/submit', (req, res) => {
  try {
    const { name, email, phone, title, text, userId, attachments } = req.body;
    if (!userId) {
      return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول أولاً لتتمكن من إرسال رسائل أو الاتصال بالدعم.' });
    }
    const userObj = dbInstance.getUsers().find(u => u.id === userId);
    if (!userObj) {
      return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول باستخدام حساب صحيح لتنفيذ هذا الإجراء.' });
    }
    if (!name || !email || !text) {
      return res.status(400).json({ error: 'الاسم، البريد الإلكتروني، ونص الرسالة حقول مطلوبة.' });
    }

    const threads = dbInstance.getContactThreads();
    const cleanEmail = email.trim().toLowerCase();

    // Look for an existing active thread for the same email that is not in trash
    let thread = threads.find(t => t.email.trim().toLowerCase() === cleanEmail && !t.isTrash);

    const newMessage = {
      id: 'cm-' + Math.random().toString(36).substr(2, 9),
      sender: 'user' as const,
      senderId: userId || undefined,
      senderName: name.trim(),
      senderEmail: cleanEmail,
      text: text.trim(),
      attachments: attachments && Array.isArray(attachments) ? attachments : [],
      createdAt: new Date().toISOString()
    };

    if (thread) {
      // Group with existing thread
      thread.messages.push(newMessage);
      thread.snippet = text.slice(0, 100);
      thread.status = 'unread';
      thread.userStatus = 'read';
      thread.updatedAt = new Date().toISOString();
      if (userId && !thread.userId) thread.userId = userId;
      if (phone) thread.phone = phone.trim();
    } else {
      // Create new thread
      const threadId = 'ct-' + Math.random().toString(36).substr(2, 9);
      thread = {
        id: threadId,
        userId: userId || undefined,
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : undefined,
        title: (title || 'رسالة اتصال جديدة').trim(),
        snippet: text.slice(0, 100),
        status: 'unread',
        userStatus: 'read',
        type: 'normal',
        isImportant: false,
        isArchived: false,
        isTrash: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [newMessage]
      };
      threads.push(thread);
    }

    dbInstance.persist();
    res.json({ success: true, threadId: thread.id, messageId: newMessage.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET user's contact threads
app.get('/api/contact/my-threads', (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'معرف المستخدم مطلوب.' });
    }

    const threads = dbInstance.getContactThreads().filter(t => t.userId === userId && !t.isTrash);
    res.json(threads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST user reply to thread
app.post('/api/contact/user-reply', (req, res) => {
  try {
    const { userId, threadId, text, attachments } = req.body;
    if (!userId || !threadId || !text) {
      return res.status(400).json({ error: 'معرف المستخدم، المحادثة والنص حقول مطلوبة.' });
    }

    const user = dbInstance.getUsers().find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير متوفر بالمنصة.' });
    }

    const threads = dbInstance.getContactThreads();
    const thread = threads.find(t => t.id === threadId && t.userId === userId);
    if (!thread) {
      return res.status(404).json({ error: 'المحادثة غير متوفرة.' });
    }

    const newMessage = {
      id: 'cm-' + Math.random().toString(36).substr(2, 9),
      sender: 'user' as const,
      senderId: userId,
      senderName: user.name,
      senderEmail: user.email,
      text: text.trim(),
      attachments: attachments && Array.isArray(attachments) ? attachments : [],
      createdAt: new Date().toISOString()
    };

    thread.messages.push(newMessage);
    thread.snippet = text.slice(0, 100);
    thread.status = 'unread'; // Unread for admin
    thread.userStatus = 'read'; // Read for user
    thread.updatedAt = new Date().toISOString();

    dbInstance.persist();
    res.json({ success: true, thread, message: newMessage });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Mark read on user side
app.post('/api/contact/user-mark-read', (req, res) => {
  try {
    const { userId, threadId } = req.body;
    if (!userId || !threadId) {
      return res.status(400).json({ error: 'المعطيات ناقصة.' });
    }

    const threads = dbInstance.getContactThreads();
    const thread = threads.find(t => t.id === threadId && t.userId === userId);
    if (thread) {
      thread.userStatus = 'read';
      thread.userReadAt = new Date().toISOString();
      dbInstance.persist();
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST admin starts thread with single or multiple users (mass messaging support!)
app.post('/api/admin/contact/start-thread', (req, res) => {
  try {
    const { adminId, userIds, title, text, type, attachments } = req.body;
    if (!adminId || !userIds || !Array.isArray(userIds) || userIds.length === 0 || !text || !title) {
      return res.status(400).json({ error: 'المدير، قائمة المستخدمين، العنوان ونص الرسالة مطلوبة.' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، هذه الصلاحية للمدراء فقط.' });
    }

    const allUsers = dbInstance.getUsers();
    const threads = dbInstance.getContactThreads();
    const createdThreads: any[] = [];

    for (const uId of userIds) {
      const recipient = allUsers.find(u => u.id === uId);
      if (!recipient) continue;

      const cleanEmail = recipient.email.trim().toLowerCase();
      // See if they have an active thread of the EXACT SAME title started recently, or simply create/append
      let thread = threads.find(t => t.email.trim().toLowerCase() === cleanEmail && t.title === title && !t.isTrash);

      const newMessage = {
        id: 'cm-' + Math.random().toString(36).substr(2, 9),
        sender: 'admin' as const,
        senderId: admin.id,
        senderName: admin.name,
        text: text.trim(),
        attachments: attachments && Array.isArray(attachments) ? attachments : [],
        createdAt: new Date().toISOString()
      };

      if (thread) {
        thread.messages.push(newMessage);
        thread.snippet = text.slice(0, 100);
        thread.status = 'read'; // read on admin side Since admin is writing
        thread.userStatus = 'unread'; // unread for user!
        thread.type = type || 'normal';
        thread.updatedAt = new Date().toISOString();
        if (!thread.userId) thread.userId = recipient.id;
      } else {
        const threadId = 'ct-' + Math.random().toString(36).substr(2, 9);
        thread = {
          id: threadId,
          userId: recipient.id,
          name: recipient.name,
          email: cleanEmail,
          phone: recipient.phone,
          title: title.trim(),
          snippet: text.slice(0, 100),
          status: 'read', // read on admin side
          userStatus: 'unread', // unread on user side
          type: type || 'normal',
          isImportant: type === 'important' ? true : false,
          isArchived: false,
          isTrash: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [newMessage]
        };
        threads.push(thread);
      }
      createdThreads.push(thread);
    }

    dbInstance.persist();
    res.json({ success: true, count: createdThreads.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET Admin-only Contact Threads
app.get('/api/admin/contact/threads', (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: 'معرف المدير مطلوب لقراءة الرسائل.' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية الوصول لمركز الرسائل.' });
    }

    const threads = dbInstance.getContactThreads();
    // Return all threads sorted by updatedAt desc
    res.json(threads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Admin reply to message thread
app.post('/api/admin/contact/reply', (req, res) => {
  try {
    const { adminId, threadId, text, attachments } = req.body;
    if (!adminId || !threadId || !text) {
      return res.status(400).json({ error: 'معرف المدير، معرف المحادثة، والرد حقول مطلوبة.' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، ليس لديك صلاحية إرسال الردود.' });
    }

    const threads = dbInstance.getContactThreads();
    const thread = threads.find(t => t.id === threadId);
    if (!thread) {
      return res.status(404).json({ error: 'المحادثة غير موجودة.' });
    }

    const newReply = {
      id: 'cm-' + Math.random().toString(36).substr(2, 9),
      sender: 'admin' as const,
      senderId: admin.id,
      senderName: admin.name,
      text: text.trim(),
      attachments: attachments && Array.isArray(attachments) ? attachments : [],
      createdAt: new Date().toISOString()
    };

    thread.messages.push(newReply);
    thread.snippet = 'الرد: ' + text.slice(0, 100);
    thread.status = 'read'; // Admin read/replied to it
    thread.userStatus = 'unread'; // Notification trigger for client!
    thread.updatedAt = new Date().toISOString();
    thread.adminReadAt = new Date().toISOString();

    dbInstance.persist();
    res.json({ success: true, thread, reply: newReply });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Thread Management Action
app.post('/api/admin/contact/thread-action', (req, res) => {
  try {
    const { adminId, threadId, action } = req.body;
    if (!adminId || !threadId || !action) {
      return res.status(400).json({ error: 'جميع معايير الطلب مطلوبة لتغيير حالة الرسالة.' });
    }

    const admin = dbInstance.getUsers().find(u => u.id === adminId && (u.role === 'admin' || u.role === 'superadmin'));
    if (!admin) {
      return res.status(403).json({ error: 'عذراً، غير مسموح لك بتعديل الرسائل.' });
    }

    const threads = dbInstance.getContactThreads();
    const idx = threads.findIndex(t => t.id === threadId);
    if (idx === -1) {
      return res.status(404).json({ error: 'المحادثة غير موجودة في النظام.' });
    }

    const thread = threads[idx];

    if (action === 'read') {
      thread.status = 'read';
    } else if (action === 'unread') {
      thread.status = 'unread';
    } else if (action === 'important_toggle') {
      thread.isImportant = !thread.isImportant;
    } else if (action === 'archive_toggle') {
      thread.isArchived = !thread.isArchived;
    } else if (action === 'trash_toggle') {
      thread.isTrash = !thread.isTrash;
    } else if (action === 'delete') {
      // Hard delete
      threads.splice(idx, 1);
    } else {
      return res.status(400).json({ error: 'إجراء غير مسموح به في النظام.' });
    }

    dbInstance.persist();
    res.json({ success: true, action, thread: action === 'delete' ? null : thread });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Serve static files and handle SPA fallback on Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static mapping
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      try {
        const fs = require('fs');
        let html = fs.readFileSync(indexPath, 'utf8');
        
        const settings = dbInstance.getSettings();
        const gi = settings.google_integration || {
          verification_code: '',
          ga_id: '',
          gtm_id: '',
          merchant_id: ''
        };

        let injections = '';

        // 1. Google Site Verification
        if (gi.verification_code) {
          injections += `\n  <meta name="google-site-verification" content="${gi.verification_code}" />`;
        }

        // 2. Google Analytics (gtag.js)
        if (gi.ga_id) {
          injections += `\n  <!-- Google Analytics -->\n  <script async src="https://www.googletagmanager.com/gtag/js?id=${gi.ga_id}"></script>`;
          injections += `\n  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gi.ga_id}');
  </script>`;
        }

        // 3. Google Tag Manager
        if (gi.gtm_id) {
          injections += `\n  <!-- Google Tag Manager -->\n  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gi.gtm_id}');</script>`;
        }

        // 4. Google Merchant Center
        if (gi.merchant_id) {
          injections += `\n  <meta name="google-merchant-id" content="${gi.merchant_id}" />`;
        }

        if (injections) {
          html = html.replace('</head>', `${injections}\n</head>`);
        }

        res.send(html);
      } catch (err) {
        res.sendFile(indexPath);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sou9AlJoumla backend running seamlessly on port ${PORT}`);
  });
}

startServer();
