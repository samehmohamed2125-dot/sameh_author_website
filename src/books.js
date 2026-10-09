import { books } from './content.js';

export const bookPath = book => `/books/${book.id}`;
export const findBook = path => books.find(book => bookPath(book) === path);

export function bookPage(book, { escape, cover, paragraphs, buy, orderDialog }) {
  return `<section class="hero container" aria-labelledby="hero-title"><div class="hero-copy"><a class="text-link" href="/#books">العودة إلى الكتب ←</a><h1 id="hero-title">${escape(book.title)}</h1><p class="subtitle">${escape(book.subtitle)}</p><div class="large-copy">${paragraphs(book.description)}</div><p class="muted">كتابة أدبية عن التجربة الإنسانية؛ ليست كتابًا علاجيًا أو طبيًا.</p><div class="purchase-line"><div><span class="price">${book.price}</span><span class="currency">جنيه مصري</span></div>${buy(book)}</div></div><div class="hero-art">${cover(book)}</div></section>${orderDialog(book)}`;
}
