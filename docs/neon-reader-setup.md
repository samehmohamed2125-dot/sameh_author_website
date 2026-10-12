# Neon reader-development connection — preparation only

This branch is an isolated **code preparation**, not a live Neon connection.

## Status

- Public website remains untouched; no reader authentication or payments are active.
- `src/reader-db.js` uses a lazy PostgreSQL pool, so the website does not attempt to connect until explicitly used.
- `scripts/check-db.js` checks `SELECT 1` and prints no credentials.
- No manuscript, database password, or connection URL belongs in this repository.

## To test (after owner approval)

1. Use Neon project `sameh-author-reader`, branch **reader-development**, database `neondb`. Do not select the production database branch.
2. In a trusted local checkout of this feature branch, install the PostgreSQL client with `npm install pg` (this will update `package.json` and `package-lock.json` together). Commit the lockfile change to the feature branch after review.
3. Set `DATABASE_URL` locally or in a **separate nonproduction** environment's secret settings. Never paste it into a chat or screenshot.
4. Run `node scripts/check-db.js` in that environment. Successful output: `Neon reader database: connection OK`.
5. Only after the test succeeds, implement the Better Auth session integration, protected reader endpoints, and access checks. The three existing reader tables alone do not constitute authentication.

## Guardrails

- Do not add `DATABASE_URL` to the production Render service during this preparation.
- Do not alter `src/server.js` or the sitemap/robots logging change.
- Do not publish the complete book PDF or book text as static assets.
- Payment is not configured and no purchase can be treated as verified.
