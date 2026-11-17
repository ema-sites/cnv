import { toClassName } from '../../scripts/aem.js';

/*
 * Listing Filter block: dropdowns, keyword box and GO button that filter a listing
 * (news releases, bid notices, map catalogue, bylaw lookup).
 * One row per control:  type | label or placeholder | options (for select)
 *   - `select` | Year | 2026, 2025, 2024  (options as a list or comma-separated;
 *     the label is the first, "all" option)
 *   - `keyword` (or `text`) | Type in keyword(s) here
 *   - `button` | GO   (optional, defaults to "GO")
 * Optional settings row: `action` | URL of the listing page (defaults to the current page).
 * On submit the values go to the query string (param = toClassName(label), `q` for keyword).
 * When the listing is on the same page, items in the following blocks/lists of the same
 * section and the next section are also filtered client-side.
 *
 * Index mode (the News Room): add a `source` row and the block lists the results itself from
 * the site index instead of filtering authored content:
 *   source  | /query-index.json
 *   folders | /city-hall/news-room/news-releases/, /city-hall/news-room/whats-new/
 *   limit   | 10   (results per page; "Show more" adds the next page)
 * A dropdown named Year matches the page's date; keywords must appear in the title or summary.
 */

let filterId = 0;

function readOptions(cell) {
  if (!cell) return [];
  const items = [...cell.querySelectorAll('li')];
  if (items.length) return items.map((li) => li.textContent.trim()).filter(Boolean);
  return cell.textContent.split(/[,\n]/).map((t) => t.trim()).filter(Boolean);
}

function listingItems(block) {
  const section = block.closest('.section') || block.parentElement;
  const scopes = [];
  if (section) {
    let el = (block.closest('.block-wrapper, [class$="-wrapper"]') || block).nextElementSibling;
    while (el) {
      scopes.push(el);
      el = el.nextElementSibling;
    }
    if (section.nextElementSibling && section.classList.contains('section')) {
      scopes.push(section.nextElementSibling);
    }
  }
  const items = [];
  scopes.forEach((scope) => {
    scope.querySelectorAll('li, tbody tr').forEach((item) => {
      if (!item.querySelector('li')) items.push(item);
    });
  });
  return items;
}

function applyClientFilter(block, values) {
  const terms = Object.values(values).map((v) => v.toLowerCase()).filter(Boolean);
  const items = listingItems(block);
  if (!items.length) return;
  let shown = 0;
  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    const match = terms.every((t) => text.includes(t));
    item.hidden = !match;
    if (match) shown += 1;
  });
  const status = block.querySelector('.listing-filter-status');
  status.textContent = terms.length ? `${shown} result${shown === 1 ? '' : 's'}` : '';
}

/* ---------- index mode: results built from the site index ---------- */

const DATE_FORMAT = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

/** An authored path that Document Authoring may have turned into a link (absolute URL). */
function toPath(value) {
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? url.pathname : url.href;
  } catch (e) {
    return value;
  }
}

/** A page's date: publication-date (or date) metadata, else /YYYY/M/D/ in its path. */
function entryDate(entry) {
  const raw = entry['publication-date'] || entry.date;
  if (raw && raw !== '0') {
    const d = /^\d+$/.test(String(raw)) ? new Date(Number(raw) * 1000) : new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const m = (entry.path || '').match(/\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

async function loadEntries({ sources, folders }) {
  const lists = await Promise.all(sources.map(async (src) => {
    try {
      const resp = await fetch(src.includes('?') ? src : `${src}?limit=5000`);
      if (!resp.ok) return [];
      return (await resp.json()).data || [];
    } catch (e) {
      return [];
    }
  }));
  const byPath = new Map();
  lists.flat().forEach((e) => {
    if (!e || !e.path || byPath.has(e.path)) return;
    const inFolder = (f) => e.path.startsWith(f) && e.path.length > f.length;
    if (folders.length && !folders.some(inFolder)) return;
    const title = e.title && e.title !== '0'
      ? String(e.title).replace(/\s*\|\s*City of North Vancouver$/, '') : '';
    if (!title) return;
    const description = e.description && e.description !== '0' ? String(e.description) : '';
    byPath.set(e.path, {
      path: e.path, title, description, date: entryDate(e),
    });
  });
  return [...byPath.values()].sort((a, b) => (b.date || 0) - (a.date || 0));
}

function resultItem(entry) {
  const li = document.createElement('li');
  li.className = 'listing-filter-result';
  if (entry.date) {
    const time = document.createElement('time');
    time.dateTime = [entry.date.getFullYear(), entry.date.getMonth() + 1, entry.date.getDate()]
      .map((n) => String(n).padStart(2, '0')).join('-');
    time.textContent = DATE_FORMAT.format(entry.date);
    li.append(time);
  }
  const h = document.createElement('h3');
  const a = document.createElement('a');
  a.href = entry.path;
  a.textContent = entry.title;
  h.append(a);
  li.append(h);
  if (entry.description) {
    const p = document.createElement('p');
    p.textContent = entry.description;
    li.append(p);
  }
  return li;
}

/**
 * Filters the index entries with the form values: a select named "year" matches the entry's
 * year; every other value (keywords, other dropdowns) must appear in the title or description.
 */
function matches(entry, values) {
  return Object.entries(values).every(([name, value]) => {
    if (!value) return true;
    if (name === 'year') return entry.date && String(entry.date.getFullYear()) === value;
    const text = `${entry.title} ${entry.description}`.toLowerCase();
    return value.toLowerCase().split(/\s+/).filter(Boolean).every((w) => text.includes(w));
  });
}

function setupIndexMode(block, settings, values) {
  const status = block.querySelector('.listing-filter-status');
  const list = document.createElement('ol');
  list.className = 'listing-filter-results';
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'listing-filter-more';
  more.textContent = 'Show more';
  more.hidden = true;
  block.append(list, more);

  let entries = null;
  let results = [];
  let shown = 0;
  const showNext = () => {
    const next = results.slice(shown, shown + settings.limit);
    list.append(...next.map(resultItem));
    shown += next.length;
    more.hidden = shown >= results.length;
  };
  more.addEventListener('click', () => {
    const first = list.children.length;
    showNext();
    const link = list.children[first] && list.children[first].querySelector('a');
    if (link) link.focus();
  });

  return async () => {
    if (!entries) {
      status.textContent = 'Loading…';
      entries = await loadEntries(settings);
    }
    const current = values();
    const filtered = Object.values(current).some(Boolean);
    results = entries.filter((e) => matches(e, current));
    list.replaceChildren();
    shown = 0;
    if (!entries.length) {
      status.textContent = 'No items are available yet.';
    } else if (!results.length) {
      status.textContent = 'No results. Try another year, or fewer or different keywords.';
    } else {
      status.textContent = filtered
        ? `${results.length} result${results.length === 1 ? '' : 's'}`
        : `Showing the latest of ${results.length} items`;
    }
    showNext();
  };
}

export default function decorate(block) {
  filterId += 1;
  const params = new URLSearchParams(window.location.search);
  let action = '';
  let buttonText = 'GO';
  const settings = { sources: [], folders: [], limit: 10 };
  const form = document.createElement('form');
  form.className = 'listing-filter-form';
  form.setAttribute('role', 'search');
  const controls = document.createElement('div');
  controls.className = 'listing-filter-controls';

  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    const type = toClassName(cells[0] ? cells[0].textContent.trim() : '');
    const label = cells[1] ? cells[1].textContent.trim() : '';
    if (type === 'action') {
      const link = cells[1] && cells[1].querySelector('a[href]');
      action = link ? link.href : label;
      return;
    }
    if (type === 'source' || type === 'sources') {
      settings.sources = [...cells[1].querySelectorAll('a[href]')].map((a) => toPath(a.href));
      if (!settings.sources.length) {
        settings.sources = label.split(',').map((s) => toPath(s.trim())).filter(Boolean);
      }
      return;
    }
    if (type === 'folders' || type === 'folder') {
      const links = [...cells[1].querySelectorAll('a[href]')].map((a) => toPath(a.href));
      settings.folders = links.length ? links
        : label.split(',').map((s) => toPath(s.trim())).filter(Boolean);
      return;
    }
    if (type === 'limit') {
      settings.limit = parseInt(label, 10) || settings.limit;
      return;
    }
    if (type === 'button' || type === 'submit') {
      if (label) buttonText = label;
      return;
    }
    const id = `listing-filter-${filterId}-${i}`;
    const labelEl = document.createElement('label');
    labelEl.className = 'listing-filter-label';
    labelEl.htmlFor = id;
    labelEl.textContent = label || (type === 'select' ? 'Filter' : 'Keyword');

    let control;
    if (type === 'select') {
      control = document.createElement('select');
      control.name = toClassName(label) || `filter-${i}`;
      const all = document.createElement('option');
      all.value = '';
      all.textContent = label || 'All';
      control.append(all);
      readOptions(cells[2]).forEach((o) => {
        const option = document.createElement('option');
        option.value = o;
        option.textContent = o;
        control.append(option);
      });
    } else if (type === 'keyword' || type === 'text' || type === 'search') {
      control = document.createElement('input');
      control.type = 'search';
      control.name = controls.querySelector('input[name="q"]') ? `q${i}` : 'q';
      control.placeholder = label;
    } else {
      return; // unknown row type
    }
    control.id = id;
    if (params.has(control.name)) control.value = params.get(control.name);

    const field = document.createElement('div');
    field.className = `listing-filter-field listing-filter-${control.tagName.toLowerCase()}`;
    field.append(labelEl, control);
    controls.append(field);
  });

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'listing-filter-submit button';
  button.textContent = buttonText;

  const status = document.createElement('p');
  status.className = 'listing-filter-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  form.append(controls, button);
  block.replaceChildren(form, status);

  const values = () => Object.fromEntries(
    [...form.elements].filter((el) => el.name).map((el) => [el.name, el.value.trim()]),
  );

  const sameListingPage = !action
    || new URL(action, window.location.href).pathname === window.location.pathname;
  const runIndex = settings.sources.length && sameListingPage
    ? setupIndexMode(block, settings, values) : null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = new URL(action || window.location.href, window.location.href);
    Object.entries(values()).forEach(([k, v]) => {
      if (v) target.searchParams.set(k, v);
      else target.searchParams.delete(k);
    });
    if (runIndex) {
      window.history.replaceState(null, '', target);
      runIndex();
    } else if (sameListingPage) {
      window.history.replaceState(null, '', target);
      applyClientFilter(block, values());
    } else {
      window.location.href = target.href;
    }
  });

  if (runIndex) {
    runIndex();
  } else if (sameListingPage && [...params.keys()].length) {
    // wait for following blocks to decorate before filtering
    window.requestAnimationFrame(() => setTimeout(() => applyClientFilter(block, values()), 500));
  }
}
