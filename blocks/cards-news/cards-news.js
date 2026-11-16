/*
 * Cards News block (homepage City News & Events list)
 *
 * A configuration block (key | value rows, read with readBlockConfig): the list is built from
 * the site's query index and shows the newest published pages under the news folders, newest
 * first. All settings are optional:
 *   source  | index URL           (default /query-index.json)
 *   folders | /path/a/, /path/b/  (default the News Releases and What's New folders)
 *   limit   | number of items     (default 4)
 */
import { readBlockConfig } from '../../scripts/aem.js';

const DEFAULTS = {
  source: '/query-index.json',
  folders: ['/city-hall/news-room/news-releases/', '/city-hall/news-room/whats-new/'],
  limit: 4,
};

/** An authored value that DA may have turned into a link (absolute URL) back into a site path. */
function toPath(value) {
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}` : url.href;
  } catch (e) {
    return value;
  }
}

function settingsFrom(block) {
  const config = readBlockConfig(block);
  const list = (v) => (Array.isArray(v) ? v : String(v).split(','))
    .map((f) => toPath(String(f).trim()))
    .filter(Boolean);
  return {
    source: config.source ? toPath(String(config.source).trim()) : DEFAULTS.source,
    folders: config.folders ? list(config.folders) : DEFAULTS.folders,
    limit: parseInt(config.limit, 10) || DEFAULTS.limit,
  };
}

/** A news page's date: its publication-date (or date) property, else /YYYY/M/D/ in its path. */
function entryDate(entry) {
  const raw = entry['publication-date'] || entry.date;
  if (raw) {
    const d = /^\d+$/.test(String(raw)) ? new Date(Number(raw) * 1000) : new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const m = (entry.path || '').match(/\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const modified = Number(entry.lastModified);
  return modified ? new Date(modified * 1000) : new Date(0);
}

async function fetchNews({ source, folders, limit }) {
  const resp = await fetch(source);
  if (!resp.ok) return [];
  const { data = [] } = await resp.json();
  return data
    .filter((e) => e.path && folders.some((f) => e.path.startsWith(f) && e.path.length > f.length))
    .filter((e) => e.title && e.title !== '0')
    .sort((a, b) => entryDate(b) - entryDate(a))
    .slice(0, limit);
}

function newsItem(entry) {
  const li = document.createElement('li');
  li.className = 'cards-news-item';
  const body = document.createElement('div');
  body.className = 'cards-news-item-body';

  const title = document.createElement('h3');
  title.className = 'cards-news-item-title';
  const link = document.createElement('a');
  link.href = entry.path;
  link.textContent = entry.title;
  title.append(link);
  body.append(title);

  if (entry.description && entry.description !== '0') {
    const p = document.createElement('p');
    p.textContent = entry.description;
    body.append(p);
  }

  const cta = document.createElement('p');
  cta.className = 'cards-news-item-cta';
  const more = document.createElement('a');
  more.href = entry.path;
  more.textContent = 'Read more';
  more.setAttribute('aria-label', `Read more: ${entry.title}`);
  cta.append(more);
  body.append(cta);

  li.append(body);
  return li;
}

/**
 * Builds the news list from the query index.
 * @param {Element} block The cards-news block element
 */
export default async function decorate(block) {
  const settings = settingsFrom(block);
  const ul = document.createElement('ul');
  ul.className = 'cards-news-items';
  block.replaceChildren(ul);
  try {
    const news = await fetchNews(settings);
    ul.append(...news.map(newsItem));
  } catch (e) {
    // the list stays empty when the index can't be read
  }
}
