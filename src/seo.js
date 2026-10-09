import { author, books, policies } from './content.js';
import { findArticle, articlePath } from './articles.js';
import { findBook, bookPath } from './books.js';
import { siteAssets } from './site-config.js';
import { socialLinks } from './social.js';

export function siteUrl() {
  const url = new URL(process.env.SITE_URL || 'https://sameh-author-website.onrender.com');
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid SITE_URL');
  return url.origin;
}
const shortDescription = text => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 170) return normalized;
  return normalized.slice(0, 170).replace(/\s+\S*$/, '') + '…';
};

export function pageMetadata(path = '/') {
  const article = findArticle(path);
  const book = findBook(path);
  const policy = policies[path];
  const missing = path !== '/' && !article && !book && !policy;
  const title = article ? `${article.title} | ${author.name}` : book ? `${book.title} — ${book.subtitle} | ${author.name}` : policy ? `${policy.title} | ${author.name}` : missing ? `الصفحة غير موجودة | ${author.name}` : `${author.name} | كاتب ومؤلف — الكتب والكتابات`;
  const description = article ? shortDescription(article.description || article.paragraphs[0]) : book ? shortDescription(`${book.subtitle}. ${book.description.split('\n\n')[0]}`) : policy ? `${policy.title} — مسودة تحتاج مراجعة قبل الإطلاق.` : missing ? 'الصفحة المطلوبة غير موجودة. العودة إلى الموقع الرسمي للكاتب سامح محمد عبد الظاهر.' : 'الموقع الرسمي للكاتب سامح محمد عبد الظاهر. تعرّف على كتاب «بعضٌ مني ومنك — عن النفس وما لا يراه أحد»، واقرأ مقالاته وكلماته الأدبية.';
  const image = article?.cover.src || book?.cover || siteAssets.socialImage || books[0]?.cover;
  const imageAlt = article?.cover.alt || book?.coverAlt || books[0]?.coverAlt;
  const imageWidth = article?.cover.width || book?.coverWidth || (!siteAssets.socialImage ? books[0]?.coverWidth : undefined);
  const imageHeight = article?.cover.height || book?.coverHeight || (!siteAssets.socialImage ? books[0]?.coverHeight : undefined);
  return { title, description, canonical: siteUrl() + (missing ? '/404' : path), noindex: Boolean(policy || missing), type: article ? 'article' : 'website', image: image ? new URL(image, siteUrl()).href : null, imageAlt, imageWidth, imageHeight };
}

export function structuredData(path = '/') {
  const base = siteUrl();
  const person = { '@type': 'Person', '@id': `${base}/#author`, name: author.name, jobTitle: author.role, description: author.bio, url: `${base}/#author`, image: new URL(author.portrait.original, base).href, sameAs: socialLinks.map(link => link.url) };
  const website = { '@type': 'WebSite', '@id': `${base}/#website`, name: `الموقع الرسمي للكاتب ${author.name}`, url: `${base}/`, inLanguage: 'ar' };
  const bookNodes = books.map(book => ({ '@type': 'Book', '@id': `${base}/#${book.id}`, name: book.title, url: base + bookPath(book), alternativeHeadline: book.subtitle, description: book.description, inLanguage: 'ar', author: { '@id': person['@id'] }, ...(book.cover ? { image: new URL(book.cover, base).href } : {}) }));
  const article = findArticle(path);
  const book = findBook(path);
  if (path !== '/' && !article && !book) return null;
  return { '@context': 'https://schema.org', '@graph': [person, website,
    ...(article ? [{ '@type': 'Article', '@id': `${base}${articlePath(article)}#article`, url: base + articlePath(article), mainEntityOfPage: base + articlePath(article), headline: article.title, description: pageMetadata(path).description, articleBody: article.paragraphs.join('\n\n'), image: new URL(article.cover.src, base).href, inLanguage: 'ar', author: { '@id': person['@id'] }, isPartOf: { '@id': website['@id'] } }] : book ? bookNodes.filter(node => node.url === base + path) : bookNodes),
  ] };
}
