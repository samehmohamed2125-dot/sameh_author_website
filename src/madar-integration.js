import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// The existing SSR, book, article and SEO routes remain authoritative.
const source = new URL('../staging/madar-sameh-v10-reviewed.html', import.meta.url);
export async function loadMadarV10() {
  const html = await readFile(source, 'utf8');
  if (!/^<!doctype html>/i.test(html)) throw new Error('Madar v10: invalid document');
  for (const required of ['مدار سامح', 'استوديو سامح', 'ink-night', 'paper-day']) {
    if (!html.includes(required)) throw new Error('Madar v10: missing required feature: ' + required);
  }
  return html;
}
export function analyzeMadarV10(html) {
  const scriptBlocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const styleBlocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
  const hash = value => "'sha256-" + createHash('sha256').update(value).digest('base64') + "'";
  return {
    bytes: Buffer.byteLength(html),
    inlineScriptHashes: scriptBlocks.filter(m => !/\bsrc\s*=/.test(m[1]) && !/type\s*=\s*["']application\/ld\+json/.test(m[1])).map(m => hash(m[2])),
    inlineStyleHashes: styleBlocks.map(m => hash(m[1])),
    hasSupabase: /supabase/i.test(html),
    hasAgora: /agora/i.test(html),
    requiresBrowserSecurityReview: /\son[a-z]+\s*=/.test(html)
  };
}
