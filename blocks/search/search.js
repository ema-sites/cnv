/*
 * Search block: site search over the site's indexes, run in the browser.
 *
 * Reads the query from ?q= (the header and homepage search boxes submit to /search?q=...).
 * Sources, merged by path (the first source wins for a page that is in both):
 *   /query-index.json   the live index of published pages
 *   /search-index.json  a snapshot of every migrated page (tools/search/build-search-index.mjs)
 * Optional key | value settings (readBlockConfig): sources (comma-separated), limit (page size).
 *
 * Every word must match. Ranking: title, then headings, then description, then page text;
 * news is shown with its date.
 */
import { readBlockConfig } from '../../scripts/aem.js';

const DEFAULT_SOURCES = ['/query-index.json', '/search-index.json'];
const PAGE_SIZE = 20;
const WEIGHTS = {
  title: 12, headings: 4, description: 3, text: 1, path: 1,
};
const DATE_FORMAT = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

const normalize = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const terms = (q) => [...new Set(normalize(q).split(/[^a-z0-9$@.'-]+/).filter((t) => t.length > 1 || /\d/.test(t)))];
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function fetchSource(url) {
  try {
    const resp = await fetch(url.includes('query-index') ? `${url}?limit=5000` : url);
    if (!resp.ok) return [];
    const { data = [] } = await resp.json();
    return data;
  } catch (e) {
    return [];
  }
}

function dateOf(entry) {
  if (entry.date) return entry.date;
  const m = (entry.path || '').match(/\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//);
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : '';
}

function prepare(entry) {
  const clean = (v) => (v && v !== '0' ? String(v) : '');
  const date = dateOf(entry);
  const e = {
    path: entry.path,
    title: clean(entry.title).replace(/\s*\|\s*City of North Vancouver$/, '') || entry.path,
    description: clean(entry.description),
    headings: clean(entry.headings),
    text: clean(entry.text),
    date,
    type: entry.type || (entry.path.startsWith('/city-hall/news-room/') && date ? 'news' : 'page'),
  };
  e.fields = Object.fromEntries(Object.keys(WEIGHTS).map((k) => [k, normalize(e[k])]));
  return e;
}

async function loadIndex(sources) {
  const lists = await Promise.all(sources.map(fetchSource));
  const byPath = new Map();
  lists.flat().forEach((entry) => {
    if (!entry || !entry.path || byPath.has(entry.path)) return;
    if (/^\/(nav|footer|original|search)$/.test(entry.path) || entry.path.startsWith('/fragments/')) return;
    byPath.set(entry.path, prepare(entry));
  });
  return [...byPath.values()];
}

function score(entry, words) {
  let total = 0;
  for (let i = 0; i < words.length; i += 1) {
    const w = words[i];
    let wordScore = 0;
    Object.entries(WEIGHTS).forEach(([field, weight]) => {
      const value = entry.fields[field];
      const at = value.indexOf(w);
      if (at < 0) return;
      // a whole-word or word-start match counts more than a match inside a word
      const start = at === 0 || /[^a-z0-9]/.test(value[at - 1]);
      wordScore += weight * (start ? 2 : 1);
    });
    if (!wordScore) return 0;
    total += wordScore;
  }
  return total;
}

/** Text with each query word wrapped in <mark>, built with DOM nodes (no HTML injection). */
function highlighted(text, words) {
  const frag = document.createDocumentFragment();
  if (!words.length) { frag.append(text); return frag; }
  const re = new RegExp(`(${words.map(escapeRe).join('|')})`, 'ig');
  text.split(re).forEach((part, i) => {
    if (i % 2) {
      const mark = document.createElement('mark');
      mark.textContent = part;
      frag.append(mark);
    } else if (part) frag.append(part);
  });
  return frag;
}

function snippet(entry, words) {
  const source = entry.description || entry.text;
  const body = entry.text || entry.description;
  // prefer a passage of the page text that contains the first matching word
  const lower = normalize(body);
  const hit = words.map((w) => lower.indexOf(w)).filter((i) => i >= 0).sort((a, b) => a - b)[0];
  const inDescription = entry.description
    && words.some((w) => normalize(entry.description).includes(w));
  if (hit === undefined || inDescription) {
    return source.length > 220 ? `${source.slice(0, 217).replace(/\s+\S*$/, '')}…` : source;
  }
  const from = Math.max(0, body.lastIndexOf(' ', Math.max(0, hit - 60)));
  const piece = body.slice(from, from + 220).replace(/\s+\S*$/, '');
  return `${from > 0 ? '…' : ''}${piece.trim()}…`;
}

function breadcrumb(path) {
  return path.split('/').filter(Boolean).slice(0, -1)
    .map((s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' › ') || 'Home';
}

function resultItem(entry, words) {
  const li = document.createElement('li');
  li.className = 'search-result';
  const meta = document.createElement('p');
  meta.className = 'search-result-meta';
  if (entry.type === 'news') {
    const badge = document.createElement('span');
    badge.className = 'search-result-type';
    badge.textContent = 'News';
    meta.append(badge);
    if (entry.date) {
      const [y, m, d] = entry.date.split('-').map(Number);
      const time = document.createElement('time');
      time.dateTime = entry.date;
      time.textContent = DATE_FORMAT.format(new Date(y, m - 1, d));
      meta.append(time);
    }
  } else {
    meta.append(breadcrumb(entry.path));
  }
  const h = document.createElement('h2');
  h.className = 'search-result-title';
  const a = document.createElement('a');
  a.href = entry.path;
  a.append(highlighted(entry.title, words));
  h.append(a);
  li.append(h, meta);
  const text = snippet(entry, words);
  if (text) {
    const p = document.createElement('p');
    p.className = 'search-result-snippet';
    p.append(highlighted(text, words));
    li.append(p);
  }
  return li;
}

function buildForm(query) {
  const form = document.createElement('form');
  form.className = 'search-form';
  form.setAttribute('role', 'search');
  form.innerHTML = `
    <label class="search-label" for="search-q">Search the City website</label>
    <div class="search-field">
      <input id="search-q" name="q" type="search" autocomplete="off" placeholder="Search for a service or topic">
      <button type="submit">Search</button>
    </div>
    <fieldset class="search-filters">
      <legend>Show</legend>
      <label><input type="radio" name="type" value="all" checked> All results</label>
      <label><input type="radio" name="type" value="page"> Pages</label>
      <label><input type="radio" name="type" value="news"> News</label>
    </fieldset>`;
  form.querySelector('input[name="q"]').value = query;
  return form;
}

/**
 * @param {Element} block The search block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const sources = config.sources
    ? String(config.sources).split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_SOURCES;
  const pageSize = parseInt(config.limit, 10) || PAGE_SIZE;
  const params = new URLSearchParams(window.location.search);

  const form = buildForm(params.get('q') || '');
  const typeParam = params.get('type');
  if (['page', 'news'].includes(typeParam)) form.querySelector(`input[value="${typeParam}"]`).checked = true;
  const status = document.createElement('p');
  status.className = 'search-status';
  status.setAttribute('role', 'status');
  const list = document.createElement('ol');
  list.className = 'search-results';
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'search-more';
  more.textContent = 'Show more results';
  more.hidden = true;
  block.replaceChildren(form, status, list, more);

  status.textContent = 'Loading search…';
  const index = await loadIndex(sources);
  let results = [];
  let shown = 0;
  let words = [];

  const showNext = () => {
    const next = results.slice(shown, shown + pageSize);
    list.append(...next.map((e) => resultItem(e, words)));
    shown += next.length;
    more.hidden = shown >= results.length;
  };

  const run = (updateUrl) => {
    const q = form.q.value.trim();
    const type = form.type.value;
    words = terms(q);
    list.replaceChildren();
    shown = 0;
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
      if (type !== 'all') url.searchParams.set('type', type); else url.searchParams.delete('type');
      window.history.replaceState(null, '', url);
    }
    if (!words.length) {
      results = [];
      more.hidden = true;
      status.textContent = index.length ? `Search ${index.length} pages of the City website.` : 'Search is not available right now.';
      return;
    }
    results = index
      .filter((e) => type === 'all' || e.type === type)
      .map((e) => ({ e, s: score(e, words) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || (b.e.date || '').localeCompare(a.e.date || ''))
      .map((r) => r.e);
    const scope = { page: ' in pages', news: ' in news' }[type] || '';
    status.textContent = results.length
      ? `${results.length} result${results.length === 1 ? '' : 's'} for “${q}”${scope}`
      : `No results for “${q}”${scope}. Check the spelling, or try fewer or different words.`;
    showNext();
  };

  form.addEventListener('submit', (ev) => { ev.preventDefault(); run(true); });
  form.querySelectorAll('input[name="type"]').forEach((r) => r.addEventListener('change', () => run(true)));
  more.addEventListener('click', () => {
    const first = list.children.length;
    showNext();
    const link = list.children[first] && list.children[first].querySelector('a');
    if (link) link.focus();
  });
  run(false);
}
