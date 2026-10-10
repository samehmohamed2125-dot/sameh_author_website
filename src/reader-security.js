import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const EMAIL_LIMIT = 254;
const PASSWORD_MIN = 12;
const PASSWORD_MAX = 1024;
const BOOK_ID = 'baad-menni-wa-menk';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// These primitives deliberately do not expose routes or store real customers.
// Storage and entitlements must be durable, private, and server-side before launch.
export function normalizeEmail(value) {
  if (typeof value !== 'string') throw new TypeError('البريد الإلكتروني غير صالح');
  const email = value.trim().toLowerCase();
  if (email.length > EMAIL_LIMIT || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new TypeError('البريد الإلكتروني غير صالح');
  }
  return email;
}

export function validatePassword(value) {
  if (typeof value !== 'string' || value.length < PASSWORD_MIN || value.length > PASSWORD_MAX) {
    throw new TypeError('كلمة المرور يجب أن تتكون من 12 حرفًا على الأقل');
  }
  return value;
}

export async function hashPassword(password) {
  validatePassword(password);
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt-v1:${salt.toString('hex')}:${key.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > PASSWORD_MAX || typeof stored !== 'string') return false;
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt-v1' ||
      !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{128}$/.test(parts[2])) return false;
  const expected = Buffer.from(parts[2], 'hex');
  const actual = await scrypt(password, Buffer.from(parts[1], 'hex'), expected.length,
    { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return timingSafeEqual(actual, expected);
}

export function createSession() {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashSessionToken(token), expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString() };
}

export function hashSessionToken(token) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return createHash('sha256').update(token).digest('hex');
}

export function sessionCookie(token, { secure = true } = {}) {
  if (!hashSessionToken(token)) throw new TypeError('Invalid session token');
  return `reader_session=${token}; Path=/api/reader; HttpOnly; SameSite=Strict; Max-Age=604800${secure ? '; Secure' : ''}`;
}

export function clearSessionCookie({ secure = true } = {}) {
  return `reader_session=; Path=/api/reader; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}

// Entitlement must be written ONLY after verified, signed provider webhook,
// matched to the server-side price (400 EGP) and order, with deduplication.
export function canReadBook({ session, entitlement, bookId = BOOK_ID, now = Date.now() }) {
  if (!session || !entitlement || bookId !== BOOK_ID) return false;
  if (typeof session.userId !== 'string' || !session.userId ||
      session.userId !== entitlement.userId || entitlement.bookId !== bookId) return false;
  const expiry = Date.parse(session.expiresAt);
  return Number.isFinite(expiry) && expiry > now && entitlement.status === 'active';
}
