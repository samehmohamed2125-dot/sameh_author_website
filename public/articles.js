export async function copyArticleLink(url, platform = globalThis.navigator) {
  try {
    if (platform?.clipboard?.writeText) { await platform.clipboard.writeText(url); return 'copied'; }
  } catch { /* Present a selectable link when clipboard permission is unavailable. */ }
  return 'manual';
}

export async function shareArticle(url, title, platform = globalThis.navigator) {
  try {
    if (typeof platform?.share === 'function') { await platform.share({ url, title }); return 'shared'; }
  } catch (error) { if (error.name === 'AbortError') return 'cancelled'; }
  return copyArticleLink(url, platform);
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('.article-actions').forEach(actions => {
    for (const [selector, share] of [['.article-share', true], ['.article-copy', false]]) {
      actions.querySelector(selector).addEventListener('click', async event => {
        const button = event.currentTarget;
        const input = actions.querySelector('.article-share-link');
        const url = new URL(actions.dataset.articlePath, location.origin).href;
        input.hidden = true;
        button.disabled = true;
        try {
          const outcome = share ? await shareArticle(url, actions.dataset.articleTitle) : await copyArticleLink(url);
          actions.querySelector('.article-share-status').textContent = { shared: 'تمت مشاركة المقال.', copied: 'تم نسخ رابط المقال.', cancelled: 'أُلغيت المشاركة.', manual: 'انسخ رابط المقال التالي يدويًا.' }[outcome];
          if (outcome === 'manual') { input.value = url; input.hidden = false; input.focus(); input.select(); }
        } finally { button.disabled = false; }
      });
    }
  });
}
