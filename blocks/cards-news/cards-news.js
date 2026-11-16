/*
 * Cards News block (homepage City News & Events list)
 *
 * The list is driven by the site's query index: the newest published pages under the news
 * folders are shown, newest first. Authored rows are the fallback while the index loads, or
 * when it is unavailable or has no news yet.
 *
 * Optional settings rows (first cell is the key):
 *   source  | index URL            (default /query-index.json)
 *   folders | /path/a/, /path/b/   (default the News Releases and What's New folders)
 *   limit   | number of items      (default: the number of authored items, or 4)
 * Item rows (any cells may be merged into one):
 *   linked title | summary | "Read more" link (optional, defaults to the title link)
 */
const DEFAULTS = {
  source: '/query-index.json',
  folders: ['/city-hall/news-room/news-releases/', '/city-hall/news-room/whats-new/'],
  limit: 4,
};
const SETTINGS = ['source', 'folders', 'limit'];

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

function readSettings(block) {
  const settings = { ...DEFAULTS };
  let authored = 0;
  let limitSet = false;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells[0]?.textContent.trim().toLowerCase();
    if (cells.length === 2 && SETTINGS.includes(key)) {
      const value = cells[1].textContent.trim();
      if (key === 'folders') {
        settings.folders = value.split(',').map((f) => f.trim()).filter(Boolean);
      } else if (key === 'limit') {
        settings.limit = parseInt(value, 10) || DEFAULTS.limit;
        limitSet = true;
      } else {
        settings.source = value;
      }
      row.remove();
    } else if (row.textContent.trim()) {
      authored += 1;
    }
  });
  // without a limit row, show as many items as the authors placed (the homepage has four)
  if (!limitSet && authored) settings.limit = authored;
  return settings;
}

async function fetchNews({ source, folders, limit }) {
  const resp = await fetch(source);
  if (!resp.ok) return [];
  const json = await resp.json();
  const rows = json.data || [];
  return rows
    .filter((e) => e.path && folders.some((f) => e.path.startsWith(f) && e.path.length > f.length))
    .filter((e) => e.title && !/^0$/.test(e.title))
    .sort((a, b) => entryDate(b) - entryDate(a))
    .slice(0, limit);
}

/** Builds one authored-style item row (title link, summary) from an index entry. */
function rowFromEntry(entry) {
  const row = document.createElement('div');
  const cell = document.createElement('div');
  const title = document.createElement('h3');
  const a = document.createElement('a');
  a.href = entry.path;
  a.textContent = entry.title;
  title.append(a);
  cell.append(title);
  if (entry.description && entry.description !== '0') {
    const p = document.createElement('p');
    p.textContent = entry.description;
    cell.append(p);
  }
  row.append(cell);
  return row;
}

function render(block, rows) {
  const ul = document.createElement('ul');
  ul.className = 'cards-news-items';

  rows.forEach((row) => {
    if (!row.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'cards-news-item';

    const content = document.createElement('div');
    content.className = 'cards-news-item-body';
    [...row.children].forEach((cell) => content.append(...cell.childNodes));

    // normalise loose text and inline elements (e.g. a bare link cell) into paragraphs
    [...content.childNodes].forEach((n) => {
      const isText = n.nodeType === Node.TEXT_NODE && n.textContent.trim();
      const isInline = n.nodeType === Node.ELEMENT_NODE
        && /^(A|STRONG|EM|SPAN|B|I)$/.test(n.tagName);
      if (isText || isInline) {
        const p = document.createElement('p');
        n.replaceWith(p);
        p.append(n);
      }
    });

    const links = [...content.querySelectorAll('a[href]')];
    let title = content.querySelector('h1, h2, h3, h4, h5, h6');
    if (!title && links.length) {
      // first link becomes the title
      const anchor = links[0].closest('p') || links[0];
      title = document.createElement('h3');
      anchor.before(title);
      title.append(links[0]);
      if (anchor !== links[0] && !anchor.textContent.trim()) anchor.remove();
    }
    if (title) title.classList.add('cards-news-item-title');

    // a trailing standalone link (not the title) is the read-more action
    const last = content.lastElementChild;
    const lastLink = last && last.querySelector('a[href]');
    const standalone = lastLink && last.textContent.trim() === lastLink.textContent.trim();
    if (last && last !== title && standalone) {
      last.classList.add('cards-news-item-cta');
    } else {
      const titleLink = title && title.querySelector('a[href]');
      if (titleLink) {
        const cta = document.createElement('p');
        cta.className = 'cards-news-item-cta';
        const a = document.createElement('a');
        a.href = titleLink.href;
        a.textContent = 'Read more';
        a.setAttribute('aria-label', `Read more: ${titleLink.textContent.trim()}`);
        cta.append(a);
        content.append(cta);
      }
    }

    li.append(content);
    ul.append(li);
  });

  block.replaceChildren(ul);
}

export default async function decorate(block) {
  const settings = readSettings(block);
  // show the authored items straight away, so the list never appears empty or shifts while loading
  render(block, [...block.children]);
  try {
    const news = await fetchNews(settings);
    if (news.length) render(block, news.map(rowFromEntry));
  } catch (e) {
    // keep the authored items when the index can't be read
  }
}
