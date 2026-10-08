import { books } from './content.js';

// Server-owned catalogue: client-submitted prices and payment claims are ignored.
export function prepareOrder(input) {
  const book = books.find(item => item.id === input?.bookId);
  if (!book) return { status: 400, body: { error: 'الكتاب غير موجود.' } };
  return { status: 503, body: {
    code: 'CHECKOUT_NOT_CONFIGURED',
    message: 'الشراء غير متاح بعد. لم يُنشأ طلب ولم يُخصم أي مبلغ.',
    bookId: book.id, amount: book.price, currency: book.currency,
  } };
}

// Future integration: persistent pending order → provider checkout → signed webhook
// → verify amount/currency/order and deduplicate → paid → private expiring download.
// Never expose a public book file or accept browser redirects as payment evidence.
