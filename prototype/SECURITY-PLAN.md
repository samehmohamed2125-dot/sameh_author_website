# Protected reader — approved prototype, not production

## Approved appearance
The reader design is warm ivory paper with refined petroleum accents (approximately 75/25), page turning, hidden table of contents and right-to-left Arabic layout. Do not change it without author approval.

## Phase 1 implemented
- `src/reader-security.js` provides server-side email normalization, scrypt password hashing/verification, cryptographically random session tokens, SHA-256 session-token hashes for database storage, HttpOnly/SameSite cookie builders, and fail-closed book entitlement checks.
- `tests/reader-security.test.js` checks password hashing, session/cookie properties, and access denial for unpaid, expired or other-user sessions.
- No real book content, buyer credentials, database, signup route or payment credentials are committed.
- This is groundwork, **not** a live authentication or payment system.

## Before enabling signup or paid reading
1. Provision a durable private database (Render Free local filesystem is not durable for customer accounts). Add unique normalized-email users, sessions (only token hashes), orders, entitlements and audit events; encrypted backups and retention policies.
2. Implement server-only registration/login/logout/me with input limits, generic login errors, rate limits, CSRF/Origin controls, session rotation and password recovery. Require HTTPS.
3. Keep manuscript in private storage, not in GitHub/public/dist or static routes. Authenticate and authorize every chapter request on the server; return only requested chapter content with no-store caching. Reader UI must never bundle the full manuscript.
4. Integrate payment provider using server-created orders at 400 EGP; signed and deduplicated webhook verifies order ID, amount and currency before writing an active entitlement.
5. Update public wording from download to in-browser reading only, finalize privacy/purchase policies and test end-to-end before enabling real payments.

Do not publish this prototype branch or merge into the deployed branch until the above is complete and explicitly approved. No browser-based DRM can completely prevent copying or screenshots.
