import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { loadMadarV10, analyzeMadarV10 } from '../src/madar-integration.js';

test('staged v10 application JavaScript parses, with correct inline block detection', async () => {
  const html = await loadMadarV10();
  const analysis = analyzeMadarV10(html);
  const allScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const executable = allScripts.filter(m => !/\bsrc\s*=/.test(m[1]) && !/application\/ld\+json/.test(m[1]));
  assert.ok(executable.length >= 1, 'application JS should be embedded');
  assert.equal(analysis.inlineScriptHashes.length, executable.length);
  assert.ok(analysis.inlineStyleHashes.length >= 1);
  for (const script of executable) new vm.Script(script[2], {filename: 'madar-v10-embedded.js'});
});

test('v10 includes owner-checked data lifecycle without replacing article text', async () => {
  const html = await loadMadarV10();
  for (const name of [
    'validateSupabasePublicKey', 'bootstrapSupabaseConnectionOnLoad',
    'saveArticleFromStudio', 'getSupabaseHeaders',
    'signOutSupabaseOwner', 'checkAgoraIntegrationReadiness'
  ]) {
    assert.ok(html.includes(name), 'missing expected integration function: ' + name);
  }
  assert.match(html, /site_owners/);
  assert.match(html, /supabase\.co/);
  assert.match(html, /\/api\/agora\/rtc-token/);
  assert.match(html, /AGORA_APP_CERTIFICATE/);
  assert.match(html, /service_role/);
});

test('JSON-LD is parseable and canonical identity survives the staged file', async () => {
  const html = await loadMadarV10();
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const structured = scripts.filter(m => /application\/ld\+json/.test(m[1]));
  assert.ok(structured.length > 0);
  for (const match of structured) assert.ok(JSON.parse(match[2]));
  assert.match(html, /سامح محمد عبد الظاهر/);
  assert.match(html, /data-theme="ink-night"/);
});
