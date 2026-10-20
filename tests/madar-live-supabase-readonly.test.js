import test from 'node:test';
import assert from 'node:assert/strict';

// Read-only live REST contract. No fixture writes, publishing, deletion, or keys in Git.
// Set MADAR_LIVE_SUPABASE_URL and MADAR_LIVE_SUPABASE_PUBLISHABLE_KEY
// in the executing environment to enable. CI without these values skips safely.
const origin = process.env.MADAR_LIVE_SUPABASE_URL;
const key = process.env.MADAR_LIVE_SUPABASE_PUBLISHABLE_KEY;
const enabled = Boolean(origin && key);
const headers = () => ({ apikey: key, Authorization: 'Bearer ' + key });

test('live Supabase anonymous article policy does not expose drafts or demo content', {skip: !enabled}, async () => {
  const base = new URL(origin);
  assert.equal(base.protocol, 'https:');
  assert.equal(base.hostname, 'zfxztrbpnhwonsdrhvcd.supabase.co', 'refuse unexpected production project');
  const url = new URL('/rest/v1/articles', base);
  url.searchParams.set('select', 'id,status,provenance_type,has_verbatim_content');
  url.searchParams.set('limit', '100');
  const response = await fetch(url, {headers: headers(), signal: AbortSignal.timeout(15000)});
  assert.equal(response.status, 200, 'read-only Supabase REST access');
  const data = await response.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.every(x => x.status === 'published' && x.provenance_type === 'author' && x.has_verbatim_content === true), 'no draft/demo/unverified rows visible');
});

test('live Supabase guest cannot select site owner identities', {skip: !enabled}, async () => {
  const url = new URL('/rest/v1/site_owners?select=user_id&limit=1', origin);
  const response = await fetch(url, {headers: headers(), signal: AbortSignal.timeout(15000)});
  assert.ok([401,403].includes(response.status), 'guest must not read site_owners: status=' + response.status);
});

test('live Supabase invalid owner token is rejected', {skip: !enabled}, async () => {
  const url = new URL('/auth/v1/user', origin);
  const response = await fetch(url, {headers: {apikey: key, Authorization: 'Bearer deliberately-invalid-owner-token'}, signal: AbortSignal.timeout(15000)});
  assert.ok([401,403].includes(response.status), 'auth must reject fake JWT: status=' + response.status);
});
