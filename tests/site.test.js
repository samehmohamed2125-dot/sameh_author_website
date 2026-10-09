import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, routes } from '../src/server.js';
import { author, books } from '../src/content.js';
import { render } from '../src/render.js';
import { structuredData } from '../src/seo.js';
import { prepareOrder } from '../src/commerce.js';
let server, base;
before(async () => { server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); base = `http://127.0.0.1:${server.address().port}`; });
after(() => new Promise(resolve => server.close(resolve)));
test('homepage preserves author text, Arabic RTL and book information', () => {
  const html = render('/');
  assert.ok(html.includes('lang="ar" dir="rtl"'));
  for (const paragraph of author.bio.split('\n\n')) assert.ok(html.includes(`<p>${paragraph}</p>`));
  for (const paragraph of books[0].description.split('\n\n')) assert.ok(html.includes(`<p>${paragraph}</p>`));
  assert.ok(html.includes(books[0].title));
  assert.ok(html.includes('400'));
  assert.ok(html.includes('مساحة الغلاف الأصلي'));
  assert.ok(!html.includes('تم الدفع'));
});
test('all public pages and assets are served, unknown routes return 404', async () => {
  for (const route of [...routes, '/styles.css', '/app.js', '/sitemap.xml', '/robots.txt']) assert.equal((await fetch(base + route)).status, 200, route);
  const response = await fetch(base + '/missing');
  assert.equal(response.status, 404);
  assert.ok((await response.text()).includes('هذه الصفحة ليست هنا'));
});
test('structured data links author and book without inventing availability', () => {
  const graph = structuredData()['@graph'];
  assert.equal(graph[0].name, author.name);
  assert.equal(graph[2].author['@id'], graph[0]['@id']);
  assert.equal(graph[2].offers, undefined);
});
test('checkout never treats client claims or manipulated price as payment', async () => {
  const response = await fetch(base + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId: books[0].id, amount: 1, paid: true }) });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.amount, 400);
  assert.equal(body.code, 'CHECKOUT_NOT_CONFIGURED');
  assert.equal(prepareOrder({ bookId: 'fake' }).status, 400);
});
test('API rejects malformed requests and cross-origin submissions', async () => {
  assert.equal((await fetch(base + '/api/orders')).status, 405);
  assert.equal((await fetch(base + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
  assert.equal((await fetch(base + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example' }, body: '{}' })).status, 403);
  assert.equal((await fetch(base + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'x'.repeat(4097) })).status, 413);
});
test('policy pages clearly remain drafts and are not indexed', () => {
  for (const route of routes.slice(1)) { const html = render(route); assert.ok(html.includes('مسودة هيكلية مؤقتة')); assert.ok(html.includes('noindex, follow')); }
});
