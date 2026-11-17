#!/usr/bin/env node
/*
 * Builds /search-index.json: a snapshot of every migrated page for the site search block.
 *
 * The site's own /query-index.json only lists published pages; this snapshot covers every page in
 * the content folder so search works before the whole site is published. The search block merges
 * both and prefers the live index for any page that is in it.
 *
 * Usage: node tools/search/build-search-index.mjs [content-dir] [output-file]
 *   defaults: content  search-index.json
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const [contentDir = 'content', outFile = 'search-index.json'] = process.argv.slice(2);
const SKIP = new Set(['/nav', '/footer', '/original', '/search']);
const TEXT_CHARS = 600;

const decode = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&rsquo;|&lsquo;/g, '\'')
  .replace(/&ldquo;|&rdquo;/g, '"').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
  .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(Number(n)));
const text = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return files(full);
    return name.endsWith('.plain.html') ? [full] : [];
  });
}

/** key | value rows of the page's metadata table */
function metadata(html) {
  const block = html.match(/<div class="metadata">([\s\S]*?)<\/div><\/div><\/div>(?:<\/div>)?\s*$/);
  const meta = {};
  if (!block) return meta;
  for (const [, k, v] of block[1].matchAll(/<div><div>([\s\S]*?)<\/div><div>([\s\S]*?)<\/div><\/div>/g)) {
    meta[text(k).toLowerCase()] = text(v);
  }
  return meta;
}

function entry(file) {
  const rel = relative(contentDir, file).split(sep).join('/').replace(/\.plain\.html$/, '');
  const path = rel === 'index' ? '/' : `/${rel.replace(/\/index$/, '')}`;
  if (SKIP.has(path) || path.startsWith('/fragments/') || path.startsWith('/drafts/')) return null;
  const html = readFileSync(file, 'utf8');
  const meta = metadata(html);
  // body text without the breadcrumb and the metadata table
  const body = html
    .replace(/<div class="metadata">[\s\S]*$/, '')
    .replace(/<div class="breadcrumb">[\s\S]*?<\/ul>/, '')
    // a notice block's first cell is its icon name, not text
    .replace(/(<div class="notice[^"]*"><div><div>)[a-z-]+(<\/div>)/g, '$1$2');
  const h1 = (body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];
  const title = (meta.title || text(h1 || '') || rel).replace(/\s*\|\s*City of North Vancouver$/, '');
  const headings = [...body.matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/g)].map((m) => text(m[1]))
    .filter(Boolean).slice(0, 12);
  const afterH1 = h1 ? body.slice(body.indexOf(h1) + h1.length) : body;
  const date = (path.match(/\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//) || []).slice(1)
    .map((n) => n.padStart(2, '0')).join('-');
  return {
    path,
    title,
    description: meta.description || '',
    headings: headings.join(' · '),
    text: text(afterH1).slice(0, TEXT_CHARS),
    type: path.startsWith('/city-hall/news-room/') && date ? 'news' : 'page',
    date,
  };
}

const data = files(contentDir).map(entry).filter(Boolean).sort((a, b) => a.path.localeCompare(b.path));
writeFileSync(outFile, `${JSON.stringify({ generated: new Date().toISOString(), total: data.length, data })}\n`);
// eslint-disable-next-line no-console
console.log(`search index: ${data.length} pages → ${outFile}`);
