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

export default function decorate(block) {
  filterId += 1;
  const params = new URLSearchParams(window.location.search);
  let action = '';
  let buttonText = 'GO';
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = new URL(action || window.location.href, window.location.href);
    Object.entries(values()).forEach(([k, v]) => {
      if (v) target.searchParams.set(k, v);
      else target.searchParams.delete(k);
    });
    if (sameListingPage) {
      window.history.replaceState(null, '', target);
      applyClientFilter(block, values());
    } else {
      window.location.href = target.href;
    }
  });

  if (sameListingPage && [...params.keys()].length) {
    // wait for following blocks to decorate before filtering
    window.requestAnimationFrame(() => setTimeout(() => applyClientFilter(block, values()), 500));
  }
}
