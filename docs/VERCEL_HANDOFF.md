# Madar Sameh — Vercel deployment handoff (2026-10-20)

## Authoritative deployment targets
- Official Vercel project: `madar-sameh-preview` (project ID `prj_GCqcS5Lo9skJZpgPJjyhwQrh8hJq`), with domains `madarsameh.com` and `www.madarsameh.com`. Do not promote until approved.
- Isolated Vercel testing project: `madar-sameh-v9-isolated` (project ID `prj_YAIZBvRffcf7lRQJsMklgqWSroZW`). Stage the reviewed v10 interface here before official release.
- Existing Vercel deployments are direct uploads (`drop`), not demonstrated to be built from this GitHub branch.
- Supabase project: `zfxztrbpnhwonsdrhvcd`; existing isolated Agora function: `madar-salon-agora-isolated`. Keep security and historical Vercel origins intact.

## Archived / not part of release
- Render service and its `website-complete-27e8ac6` branch are historical reference only. No Render publish, promotion, or env changes.
- `src/server.js` and `src/madar-integration.js` currently contain an experimental **loopback-only Node preview** for v10; those files are **not** evidence of a Vercel integration, and must not be promoted as the site's canonical frontend.
- Preserve all prior files and commits. Do not delete Render or its repository artifacts solely to retire it from this delivery path.

## Review gates before any Vercel deployment
1. Compare deployed Vercel `src/index.html`, `src/salon-live.js`, `src/vercel.json`, article routes and metadata with v10 staging. Keep original author photos, bio, texts and studio modules.
2. Port v10 into the **actual Vercel build/deployment structure**, not the separate historical Node SSR site.
3. Validate Supabase owner and anonymous RLS using non-destructive tests; do not copy secret keys to browser files.
4. Keep Agora token generation on server/Supabase, verify origin allowlist, token roles and revocation limits; no live-room creation or paid tests without approval.
5. Deploy only to isolated Vercel project first; require explicit approval to update official Vercel domains.
