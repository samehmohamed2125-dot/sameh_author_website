// Inert analytics foundation. No cookies, identifiers or network tracking.
export function measure(event, details = {}) {
  document.dispatchEvent(new CustomEvent('site:measurement', { detail: { event, ...details } }));
}
const dialog = document.querySelector('#order-dialog');
let selectedBook;
let trigger;
document.querySelectorAll('.buy-button').forEach(button => button.addEventListener('click', () => {
  trigger = button;
  selectedBook = button.dataset.bookId;
  const card = button.closest('.book-card');
  document.querySelector('#order-title').textContent = card?.querySelector('h3')?.textContent || document.querySelector('#hero-title').textContent;
  document.querySelector('#order-subtitle').textContent = card?.querySelector('p')?.textContent || document.querySelector('.subtitle').textContent;
  document.querySelector('#order-price').textContent = card?.querySelector('.book-price')?.textContent || `${document.querySelector('.price').textContent} جنيه مصري`;
  document.querySelector('#order-status').textContent = '';
  dialog.showModal();
  measure('checkout_view', { bookId: selectedBook });
}));
dialog?.addEventListener('close', () => trigger?.focus());
document.querySelector('#checkout-button')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  const status = document.querySelector('#order-status');
  status.textContent = 'جارٍ التحقق…';
  try {
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId: selectedBook }) });
    const result = await response.json();
    status.textContent = result.message || result.error || 'الشراء غير متاح حاليًا.';
  } catch {
    status.textContent = 'تعذّر الاتصال. لم يتم تأكيد أي عملية شراء. حاول لاحقًا.';
  } finally { button.disabled = false; }
});
