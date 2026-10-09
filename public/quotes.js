export async function shareQuote(url, title, platform = globalThis.navigator, request = globalThis.fetch) {
  try {
    if (typeof platform?.share === 'function') {
      // Prefer sharing the original image when the browser supports file sharing.
      if (typeof platform.canShare === 'function' && typeof File !== 'undefined') {
        try {
          const response = await request(url);
          if (!response.ok) throw new Error('Image unavailable');
          const file = new File([await response.blob()], 'sameh-quote.jpg', { type: 'image/jpeg' });
          if (platform.canShare({ files: [file] })) {
            await platform.share({ files: [file], title });
            return 'shared';
          }
        } catch (error) {
          if (error.name === 'AbortError') return 'cancelled';
          // Continue with a URL when file sharing is unavailable or fails.
        }
      }
      await platform.share({ title, url });
      return 'shared';
    }
  } catch (error) { if (error.name === 'AbortError') return 'cancelled'; }
  try {
    if (platform?.clipboard?.writeText) {
      await platform.clipboard.writeText(url);
      return 'copied';
    }
  } catch { /* Show the selectable URL when clipboard permission is denied. */ }
  return 'manual';
}

if (typeof document !== 'undefined') {
  const dialog = document.querySelector('#quote-dialog');
  let opener;
  document.querySelectorAll('.quote-open').forEach(link => link.addEventListener('click', event => {
    if (!dialog?.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    const frame = link.querySelector('.quote-frame').cloneNode(true);
    frame.querySelector('img').loading = 'eager';
    document.querySelector('#quote-view').replaceChildren(frame);
    document.querySelector('#quote-download').href = link.href;
    dialog.showModal();
  }));
  dialog?.addEventListener('close', () => opener?.focus());
  document.querySelectorAll('.quote-share').forEach(button => button.addEventListener('click', async () => {
    const card = button.closest('.quote-card');
    const status = card.querySelector('.quote-status');
    const input = card.querySelector('.quote-share-link');
    const url = new URL(button.dataset.url, location.href).href;
    input.hidden = true;
    button.disabled = true;
    try {
      const result = await shareQuote(url, button.dataset.title);
      status.textContent = { shared: 'تمت المشاركة.', copied: 'تم نسخ رابط الصورة.', cancelled: 'أُلغيت المشاركة.', manual: 'انسخ الرابط التالي لمشاركة الصورة.' }[result];
      if (result === 'manual') { input.value = url; input.hidden = false; input.focus(); input.select(); }
    } finally { button.disabled = false; }
  }));
}
