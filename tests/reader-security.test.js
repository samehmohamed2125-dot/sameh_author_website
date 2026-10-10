import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeEmail, validatePassword, hashPassword, verifyPassword,
  createSession, hashSessionToken, sessionCookie, clearSessionCookie, canReadBook,
} from '../src/reader-security.js';

test('normalize email and reject invalid addresses', () => {
  assert.equal(normalizeEmail('  Reader@Example.COM '), 'reader@example.com');
  assert.throws(() => normalizeEmail('not-an-email'));
});

test('passwords are validated and hashed with random salts', async () => {
  assert.throws(() => validatePassword('short'));
  const stored = await hashPassword('correct horse battery staple');
  assert.notEqual(stored, 'correct horse battery staple');
  assert.notEqual(stored, await hashPassword('correct horse battery staple'));
  assert.equal(await verifyPassword('correct horse battery staple', stored), true);
  assert.equal(await verifyPassword('wrong password', stored), false);
  assert.equal(await verifyPassword('correct horse battery staple', 'malformed'), false);
});

test('session tokens are random, hashed for storage, and cookies are HttpOnly', () => {
  const a = createSession(), b = createSession();
  assert.notEqual(a.token, b.token);
  assert.equal(hashSessionToken(a.token), a.tokenHash);
  assert.equal(hashSessionToken('invalid'), null);
  assert.match(sessionCookie(a.token), /HttpOnly; SameSite=Strict; Max-Age=604800; Secure/);
  assert.match(clearSessionCookie(), /Max-Age=0; Secure/);
});

test('reader access requires active entitlement belonging to signed-in user', () => {
  const session = { userId: 'reader-1', expiresAt: new Date(Date.now() + 60_000).toISOString() };
  const entitlement = { userId: 'reader-1', bookId: 'baad-menni-wa-menk', status: 'active' };
  assert.equal(canReadBook({ session, entitlement }), true);
  assert.equal(canReadBook({ session, entitlement: { ...entitlement, userId: 'reader-2' } }), false);
  assert.equal(canReadBook({ session, entitlement: { ...entitlement, status: 'pending' } }), false);
  assert.equal(canReadBook({ session: { ...session, expiresAt: '2000-01-01' }, entitlement }), false);
  assert.equal(canReadBook({ session, entitlement, bookId: 'other-book' }), false);
  assert.equal(canReadBook({ session: null, entitlement }), false);
});
