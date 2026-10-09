import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { createServer, publicRoutes, sitemap, robots } from '../src/server.js';
import { pageMetadata, siteUrl, structuredData } from '../src/seo.js';
import { articles, articlePath } from '../src/articles.js';
import { books, author, policies } from '../src/content.js';
import { bookPath } from '../src/books.js';
import { responsiveImages, imageVariants } from '../src/image-assets.js';
import { render, escape } from '../src/render.js';

let server, base;
before(async () => {
  server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));

function schemaFrom(html) {
  const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(raw);
  return { raw, data: JSON.parse(raw) };
}

test('canonical origin defaults to the supplied live domain and supports an explicit environment override', () => {
  const previous = process.env.SITE_URL;
  try {
    delete process.env.SITE_URL;
    assert.equal(siteUrl(), 'https://sameh-author-website.onrender.com');
    process.env.SITE_URL = 'https://example.test/';
    assert.equal(pageMetadata(articlePath(articles[0])).canonical, 'https://example.test' + articlePath(articles[0]));
    process.env.SITE_URL = 'file:///tmp/site';
    assert.throws(siteUrl);
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});

test('all five public pages send unique Arabic metadata and JSON-LD directly in their HTTP HTML', async () => {
  const titles = new Set();
  assert.equal(publicRoutes().length, 5);
  for (const path of publicRoutes()) {
    const response = await fetch(base + path + '?source=test');
    assert.equal(response.status, 200);
    const html = await response.text();
    const meta = pageMetadata(path);
    assert.ok(html.includes(`<title>${escape(meta.title)}</title>`));
    assert.ok(meta.description.length > 20 && meta.description.length <= 171);
    titles.add(meta.title);
    assert.ok(html.includes(`rel="canonical" href="${siteUrl() + path}"`));
    for (const key of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'twitter:card', 'twitter:image']) assert.ok(html.includes(key));
    assert.ok(html.includes('lang="ar" dir="rtl"'));
    assert.ok(!html.includes('noindex'));
    assert.ok(html.includes(`content="${meta.image}"`));
    const { raw, data } = schemaFrom(html);
    assert.equal(data['@graph'][0].name, author.name);
    assert.equal(data['@graph'][0].description, author.bio);
    assert.ok(!raw.includes('aggregateRating'));
    assert.ok(!raw.includes('datePublished'));
    assert.ok(!raw.includes('dateModified'));
    const hash = createHash('sha256').update(raw).digest('base64');
    assert.ok(response.headers.get('content-security-policy').includes(`'sha256-${hash}'`));
    assert.ok(!response.headers.get('content-security-policy').includes("'unsafe-inline'"));
    const head = await fetch(base + path, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
  }
  assert.equal(titles.size, 5);
});

test('article schema preserves exact literary content and approved original social images', () => {
  for (const article of articles) {
    const path = articlePath(article);
    const node = structuredData(path)['@graph'].find(value => value['@type'] === 'Article');
    assert.equal(node.headline, article.title);
    assert.equal(node.articleBody, article.paragraphs.join('\n\n'));
    assert.equal(node.image, siteUrl() + article.cover.src);
    assert.equal(node.author['@id'], siteUrl() + '/#author');
    assert.equal(node.mainEntityOfPage, siteUrl() + path);
    assert.equal(pageMetadata(path).image, siteUrl() + article.cover.src);
  }
});

test('book page preserves description, price and disabled checkout and has trustworthy Book schema', async () => {
  const book = books[0];
  const response = await fetch(base + bookPath(book));
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const text of book.description.split('\n\n')) assert.ok(html.includes(`<p>${escape(text)}</p>`));
  assert.ok(html.includes('400'));
  assert.ok(html.includes('data-book-id="' + book.id + '"'));
  for (const id of ['order-dialog', 'order-title', 'order-subtitle', 'order-price', 'checkout-button']) assert.ok(html.includes(`id="${id}"`));
  assert.ok(html.includes('الشراء والدفع غير مفعّلين حاليًا'));
  assert.ok(render('/').includes(`href="${bookPath(book)}"`));
  const node = schemaFrom(html).data['@graph'].find(value => value['@type'] === 'Book');
  assert.equal(node.name, book.title);
  assert.equal(node.description, book.description);
  assert.equal(node.offers, undefined);
  assert.equal(node.url, siteUrl() + bookPath(book));
});

test('sitemap and robots include only public content and keep drafts and policy pages unindexed', async () => {
  const draft = { ...articles[0], slug: 'private-draft-test', status: 'draft' };
  articles.push(draft);
  try {
    const xml = sitemap();
    assert.equal((xml.match(/<loc>/g) || []).length, 5);
    for (const path of publicRoutes()) assert.ok(xml.includes(`<loc>${siteUrl() + path}</loc>`));
    for (const path of [...Object.keys(policies), articlePath(draft), '/404', '/api/orders']) assert.ok(!xml.includes(path));
    assert.ok(robots().includes(`Sitemap: ${siteUrl()}/sitemap.xml`));
    assert.ok(robots().includes('Disallow: /api/'));
    assert.ok(robots().includes('Allow: /'));
    for (const path of [articlePath(draft), '/missing']) {
      const response = await fetch(base + path);
      assert.equal(response.status, 404);
      assert.ok((await response.text()).includes('noindex, follow'));
      assert.equal(structuredData(path), null);
    }
  } finally { articles.pop(); }
  assert.equal((await fetch(base + '/sitemap.xml')).status, 200);
  assert.equal((await fetch(base + '/robots.txt')).status, 200);
});

test('mobile derivatives are smaller, served as WebP, and original covers remain the image fallback', async () => {
  assert.equal(imageVariants.length, 7);
  for (const [src, image] of Object.entries(responsiveImages)) {
    for (const variant of image.variants) {
      assert.ok((await stat('public' + variant.src)).size < (await stat('public' + src)).size);
      const response = await fetch(base + variant.src);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'image/webp');
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile('public' + variant.src));
    }
  }
  const home = render('/');
  assert.ok(home.includes('baad-menni-wa-menk-cover-480.webp 480w'));
  for (const article of articles) {
    const html = render(articlePath(article));
    assert.ok(html.includes(`src="${article.cover.src}"`));
    assert.ok(html.includes(`${article.cover.src} ${article.cover.width}w`));
    assert.ok(html.includes('sizes="'));
    assert.ok(html.includes('fetchpriority="high"'));
  }
});
