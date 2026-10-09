import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer, sitemap } from '../src/server.js';

test('Google verification URL serves the exact file, not the homepage, with GET and HEAD', async () => {
  const path = '/google010a1ca1522ed3ff.html';
  const original = await readFile(new URL('../public' + path, import.meta.url));
  assert.equal(original.toString(), 'google-site-verification: google010a1ca1522ed3ff.html');
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), original);
    const head = await fetch(base + path, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    assert.equal((await fetch(base + '/google-missing-verification.html')).status, 404);
    assert.ok(!sitemap().includes(path));
  } finally { await new Promise(resolve => server.close(resolve)); }
});
