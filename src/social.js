// Author-provided URLs. Keep the personal Facebook account and official page distinct.
export const socialLinks = [
  { platform: 'facebook', label: 'فيسبوك — الحساب الشخصي', url: 'https://www.facebook.com/share/1Pve2xgSJm/' },
  { platform: 'facebook', label: 'فيسبوك — الصفحة الرسمية', url: 'https://www.facebook.com/share/1MkVDfiUkx/' },
  { platform: 'instagram', label: 'إنستجرام', url: 'https://www.instagram.com/sameh_abdelzaher_/' },
  { platform: 'tiktok', label: 'تيك توك', url: 'https://www.tiktok.com/@sameh_abdelzaher' },
  { platform: 'x', label: 'X (تويتر سابقًا)', url: 'https://x.com/hu1111000' },
];

const icons = {
  facebook: '<path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.095 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.49 0-1.956.931-1.956 1.887v2.263h3.328l-.532 3.49h-2.796V24C19.612 23.095 24 18.1 24 12.073z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2"/>',
  tiktok: '<path d="M16.6 0c.4 3.4 2.3 5.5 5.6 5.7v4c-1.9.1-3.6-.5-5.3-1.5v8.1c0 10.3-11.2 9.4-12.8 2.8-1-4.3 1.7-8.6 6.6-8.8v4.2c-.5.1-1 .2-1.4.4-1.4.7-2 2.4-1.3 3.8 1 2 4.6 2.6 4.6-1.4V0h4z"/>',
  x: '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933zm-1.29 19.49h2.039L6.487 3.24H4.3l13.312 17.403z"/>',
};

export function contactSection(escape, email) {
  return `<section class="contact section" id="contact" aria-labelledby="contact-title"><div class="container"><p class="eyebrow">05 / تواصل</p><h2 id="contact-title">تواصل مع الكاتب</h2><p>للكلمة مساحة، وللتواصل أيضًا.</p><ul class="social-links">${socialLinks.map(link => `<li><a class="social-link" href="${escape(link.url)}" target="_blank" rel="noopener noreferrer"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">${icons[link.platform]}</svg><span>${escape(link.label)}<span class="visually-hidden"> — يفتح في تبويب جديد</span></span><span class="social-arrow" aria-hidden="true">↗</span></a></li>`).join('')}</ul>${email ? `<p><a href="mailto:${escape(email)}">${escape(email)}</a></p>` : ''}</div></section>`;
}
