import test from 'node:test';
import assert from 'node:assert/strict';
import { loadMadarV10, analyzeMadarV10 } from '../src/madar-integration.js';
import { createServer } from '../src/server.js';

test('v10 staged document retains approved identity and integration markers', async () => {
  const html = await loadMadarV10();
  const result = analyzeMadarV10(html);
  assert.ok(result.bytes > 100_000);
  assert.ok(result.hasSupabase, 'Supabase integration marker');
  assert.ok(result.hasAgora, 'Agora integration marker');
  assert.ok(result.inlineScriptHashes.length > 0);
  assert.ok(result.inlineStyleHashes.length > 0);
  assert.match(html, /سامح محمد عبد الظاهر/);
});

test('unapproved v10 preview stays unavailable even on localhost', async t => {
  const previous = process.env.MADAR_V10_LOCAL_PREVIEW;
  delete process.env.MADAR_V10_LOCAL_PREVIEW;
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    if (previous === undefined) delete process.env.MADAR_V10_LOCAL_PREVIEW;
    else process.env.MADAR_V10_LOCAL_PREVIEW = previous;
  });
  const port = server.address().port;
  const response = await fetch('http://127.0.0.1:' + port + '/__integration/madar-v10');
  assert.equal(response.status, 404);
  assert.equal(await response.text(), '');
  const main = await fetch('http://127.0.0.1:' + port + '/');
  assert.equal(main.status, 200);
  assert.match(await main.text(), /<html lang="ar" dir="rtl">/);
});

test('explicit local v10 preview is noindex and disables browser scripts', async t => {
  const previous = process.env.MADAR_V10_LOCAL_PREVIEW;
  process.env.MADAR_V10_LOCAL_PREVIEW = '1';
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    if (previous === undefined) delete process.env.MADAR_V10_LOCAL_PREVIEW;
    else process.env.MADAR_V10_LOCAL_PREVIEW = previous;
  });
  const response = await fetch('http://127.0.0.1:' + server.address().port + '/__integration/madar-v10');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-security-policy'), /script-src 'none'/);
  assert.match(response.headers.get('x-robots-tag'), /noindex/);
  assert.equal(response.headers.get('x-madar-integration-status'), 'visual-only');
  assert.match(await response.text(), /مدار سامح/);
});
