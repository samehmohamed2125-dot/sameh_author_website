import { test } from 'node:test';
import assert from 'node:assert/strict';
import { render } from '../src/render.js';
import { socialLinks } from '../src/social.js';

test('contact section preserves all five exact official social links and account labels', () => {
  const html = render('/');
  const section = html.match(/<section[^>]*id="contact"[\s\S]*?<\/section>/)[0];
  assert.ok(section.includes('aria-labelledby="contact-title"'));
  assert.ok(section.includes('<h2 id="contact-title">تواصل مع الكاتب</h2>'));
  const links = [...section.matchAll(/<a class="social-link" href="([^"]+)" target="_blank" rel="noopener noreferrer">/g)].map(match => match[1]);
  assert.deepEqual(links, [
    'https://www.facebook.com/share/1Pve2xgSJm/',
    'https://www.facebook.com/share/1MkVDfiUkx/',
    'https://www.instagram.com/sameh_abdelzaher_/',
    'https://www.tiktok.com/@sameh_abdelzaher',
    'https://x.com/hu1111000',
  ]);
  for (const link of socialLinks) assert.ok(section.includes(link.label));
  assert.ok(!section.includes('ستُضاف وسيلة التواصل'));
  assert.ok(html.includes('<a href="/#contact">تواصل مع الكاتب</a>'));
});

test('social links provide text labels, keyboard anchors and hidden decorative icons', () => {
  const section = render('/').match(/<section[^>]*id="contact"[\s\S]*?<\/section>/)[0];
  assert.equal([...section.matchAll(/aria-hidden="true" focusable="false"/g)].length, 5);
  assert.equal([...section.matchAll(/يفتح في تبويب جديد/g)].length, 5);
  assert.ok(!section.includes('tabindex="-1"'));
  assert.ok(!section.includes('علامة توثيق'));
});
