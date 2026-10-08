import { author, books } from './content.js';
export function siteUrl() {
  const url = new URL(process.env.SITE_URL || 'http://localhost:3000');
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid SITE_URL');
  return url.origin;
}
export function structuredData() {
  const base = siteUrl();
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Person', '@id': `${base}/#author`, name: author.name, jobTitle: author.role, description: author.bio, url: `${base}/#author` },
    { '@type': 'WebSite', '@id': `${base}/#website`, name: `الموقع الرسمي للكاتب ${author.name}`, url: base, inLanguage: 'ar' },
    ...books.map(book => ({ '@type': 'Book', '@id': `${base}/#${book.id}`, name: book.title,
      alternativeHeadline: book.subtitle, description: book.description, inLanguage: 'ar',
      author: { '@id': `${base}/#author` }, ...(book.cover ? { image: new URL(book.cover, base).href } : {}) })),
  ] };
}
