import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from '../src/server.js';
import { render } from '../src/render.js';
import { quotes } from '../src/quotes.js';
import { shareQuote } from '../public/quotes.js';

let server, base;
before(async () => {
  server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));

test('five original quotes appear in requested order with accessible actions', () => {
  const html = render('/');
  const section = html.match(/<section[^>]*id="my-words"[\s\S]*?<\/section>/)[0];
  assert.equal(quotes.length, 5);
  assert.ok(quotes[0].alt.startsWith('عوضه ليس مجرد بديل؛'));
  assert.deepEqual([...section.matchAll(/data-quote-id="([^"]+)"/g)].map(match => match[1]), quotes.map(quote => quote.id));
  for (const quote of quotes) {
    assert.ok(section.includes(`alt="${quote.alt}"`));
    assert.ok(section.includes(`download="sameh-${quote.id}.jpg"`));
    assert.ok(section.includes(`data-url="${quote.src}"`));
  }
  assert.equal(section.match(/quote-frame-trimmed/g).length, 1);
  assert.equal(quotes.at(-1).id, 'giving');
  assert.ok(html.includes('id="quote-dialog"'));
  assert.ok(html.includes('src="/quotes.js"'));
});

test('server delivers every original quote and gallery script', async () => {
  for (const quote of quotes) {
    const response = await fetch(base + quote.src);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/jpeg');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(new URL('../public' + quote.src, import.meta.url)));
  }
  assert.equal((await fetch(base + '/quotes.js')).status, 200);
});

test('share uses original image when native file sharing is supported', async () => {
  let payload;
  const result = await shareQuote('https://example.test/quote.jpg', 'اقتباس', {
    canShare: data => data.files[0].type === 'image/jpeg',
    share: async data => { payload = data; },
  }, async () => ({ ok: true, blob: async () => new Blob(['original'], { type: 'image/jpeg' }) }));
  assert.equal(result, 'shared');
  assert.equal(await payload.files[0].text(), 'original');
});

test('sharing falls back to link, clipboard, then manual copy', async () => {
  const url = 'https://example.test/quote.jpg';
  let shared, copied;
  assert.equal(await shareQuote(url, 'اقتباس', { share: async data => { shared = data; } }), 'shared');
  assert.equal(shared.url, url);
  assert.equal(await shareQuote(url, 'اقتباس', { clipboard: { writeText: async value => { copied = value; } } }), 'copied');
  assert.equal(copied, url);
  assert.equal(await shareQuote(url, 'اقتباس', {}), 'manual');
  assert.equal(await shareQuote(url, 'اقتباس', { clipboard: { writeText: async () => { throw new Error('Denied'); } } }), 'manual');
});

test('cancelled sharing is handled without a false success message', async () => {
  assert.equal(await shareQuote('https://example.test/quote.jpg', 'اقتباس', {
    share: async () => { throw new DOMException('Cancelled', 'AbortError'); },
  }), 'cancelled');
});
