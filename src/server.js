import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { render } from './render.js';
import { policies } from './content.js';
import { siteUrl } from './seo.js';
import { prepareOrder } from './commerce.js';
import { books, author } from './content.js';
import { siteAssets } from './site-config.js';
import path from 'node:path';
import { quotes } from './quotes.js';
export const routes = ['/', ...Object.keys(policies)];
export function sitemap() { return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl().replace(/&/g, '&amp;')}/</loc></url></urlset>`; }
export function robots() { return `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${siteUrl()}/sitemap.xml\n`; }
const assets = { '/styles.css': 'text/css; charset=utf-8', '/app.js': 'text/javascript; charset=utf-8', '/quotes.js': 'text/javascript; charset=utf-8' };
const imageTypes = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };
for (const asset of [siteAssets.favicon, siteAssets.socialImage, author.portrait?.src, author.portrait?.original, ...books.map(book => book.cover), ...quotes.map(quote => quote.src)]) {
  if (!asset) continue;
  if (!/^\/[a-zA-Z0-9/_-]+\.(svg|png|jpe?g|webp|ico)$/.test(asset)) throw new Error('Public image must have a safe local asset path');
  assets[asset] = imageTypes[path.extname(asset)];
}
export function createServer() {
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname === '/api/orders') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }); return res.end(JSON.stringify({ error: 'طريقة غير مسموحة.' })); }
        if (req.headers.origin && req.headers.origin !== siteUrl()) { res.writeHead(403); return res.end(JSON.stringify({ error: 'مصدر الطلب غير مسموح.' })); }
        if (!req.headers['content-type']?.startsWith('application/json')) { res.writeHead(415); return res.end(JSON.stringify({ error: 'أرسل بيانات JSON.' })); }
        let raw = ''; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 4096) { res.writeHead(413); return res.end(JSON.stringify({ error: 'الطلب أكبر من الحد المسموح.' })); } raw += chunk; }
        let input;
        try { input = JSON.parse(raw); } catch { res.writeHead(400); return res.end(JSON.stringify({ error: 'بيانات غير صالحة.' })); }
        const result = prepareOrder(input);
        res.writeHead(result.status); return res.end(JSON.stringify(result.body));
      }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
      if (assets[pathname]) { const data = await readFile(new URL(`../public${pathname}`, import.meta.url)); res.writeHead(200, { 'Content-Type': assets[pathname], 'Cache-Control': 'public, max-age=3600' }); return res.end(req.method === 'HEAD' ? undefined : data); }
      if (pathname === '/sitemap.xml' || pathname === '/robots.txt') { res.writeHead(200, { 'Content-Type': pathname.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8' }); return res.end(req.method === 'HEAD' ? undefined : pathname.endsWith('.xml') ? sitemap() : robots()); }
      const exists = routes.includes(pathname);
      res.writeHead(exists ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : render(pathname));
    } catch { if (!res.headersSent) res.writeHead(500); res.end('تعذّر تنفيذ الطلب.'); }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Author website listening on port ${port}`));
}
