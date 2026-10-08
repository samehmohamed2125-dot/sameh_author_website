import { mkdir, rm, writeFile, cp } from 'node:fs/promises';
import { render } from '../src/render.js';
import { routes, sitemap, robots } from '../src/server.js';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
for (const route of routes) {
  const dir = route === '/' ? 'dist' : `dist${route}`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/index.html`, render(route));
}
await writeFile('dist/404.html', render('/404'));
await writeFile('dist/sitemap.xml', sitemap());
await writeFile('dist/robots.txt', robots());
console.log('Built homepage, four policy pages, 404, assets and SEO files.');
