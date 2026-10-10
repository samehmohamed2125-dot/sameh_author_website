# Reader account database — experimental branch only

**Chosen design:** private managed PostgreSQL (15+), separate from the ephemeral Render Free app filesystem. This folder is a schema blueprint, not an actual provisioned or connected database.

## Contents
- `migrations/001_reader_accounts.sql`: users, hashed sessions, server-priced orders (400 EGP represented as 40000 piasters), entitlements and idempotent payment events.
- No buyer data, passwords, private book text or payment keys are stored in the repository.

## Setup required before any real accounts
1. Choose and provision a managed PostgreSQL service with persistent storage, backups, SSL/TLS, restricted access and an appropriate data region. Review cost and data-protection terms with the author before activating it.
2. Set `DATABASE_URL` as a private deployment secret, never in GitHub or client-side JavaScript. Use least-privileged application and migration roles.
3. Apply the SQL migration with the migration role. Test it on a disposable database and back up before changing a live database.
4. Implement parameterized SQL access through a maintained PostgreSQL driver, connection pooling, account endpoints, login throttling, verification/recovery and CSRF protections. The project currently has no DB driver or account endpoints.
5. For each paid order: validate a **signed** payment webhook, query the provider when needed, compare server-side amount/currency/order and write the event, paid order and entitlement atomically. Browser redirects do not grant access.
6. Keep the manuscript in private storage, serve authorized chapters only, and never put its bytes in `public/`, `dist/` or GitHub.

## Operational details
- Sessions store SHA-256 token hashes only. Delete expired sessions and enforce revocation on every read.
- Passwords are scrypt-hashed by the existing server helper; plan an algorithm upgrade and password-reset process.
- Use parameterized queries and application-side email normalization.
- An active entitlement is not proof of payment on its own: grant it only in the verified payment transaction. Restrict direct DB writes to the application service.
- Establish an account deletion, refund, retention, audit and backup policy before launch.
- A lifetime reading purchase requires a clear service-continuity and access policy; never promise absolute perpetual hosting.

No changes have been made to the deployed branch.
