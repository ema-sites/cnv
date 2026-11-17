/*
 * Services block: the homepage "What do you need today?" router.
 *
 * Authoring (Document Authoring table, block name "Services"), one row per tile:
 *   :icon-name: [Label](link)   |  optional second line (e.g. the system name, "CityFix")
 * and optionally one search row:
 *   search  |  placeholder text  |  optional search page (default /search)
 *
 * Each tile is one link (icon, label, second line), so keyboard and screen-reader users get one
 * stop and one name per service.
 */

function searchForm([, placeholderCell, actionCell]) {
  const form = document.createElement('form');
  form.className = 'services-search';
  form.setAttribute('role', 'search');
  const actionLink = actionCell && actionCell.querySelector('a');
  form.action = (actionLink && actionLink.getAttribute('href')) || (actionCell && actionCell.textContent.trim()) || '/search';

  const label = document.createElement('label');
  label.className = 'services-search-label';
  label.htmlFor = 'services-search-q';
  label.textContent = 'Search the City website';

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.id = 'services-search-q';
  input.placeholder = (placeholderCell && placeholderCell.textContent.trim()) || 'Search';

  const button = document.createElement('button');
  button.type = 'submit';
  button.setAttribute('aria-label', 'Search');
  button.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';

  form.append(label, input, button);
  return form;
}

/** An icon authored as :name: text (Document Authoring turns it into a span on publish). */
function iconFrom(cell) {
  const existing = cell.querySelector('.icon');
  if (existing) return existing;
  const m = cell.textContent.match(/:([a-z0-9-]+):/);
  if (!m) return null;
  const span = document.createElement('span');
  span.className = `icon icon-${m[1]}`;
  const img = document.createElement('img');
  img.src = `${window.hlx.codeBasePath}/icons/${m[1]}.svg`;
  img.alt = '';
  img.loading = 'lazy';
  img.width = 32;
  img.height = 32;
  span.append(img);
  return span;
}

function tile([main, note]) {
  const source = main && main.querySelector('a[href]');
  if (!source) return null;
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = source.getAttribute('href');
  const icon = iconFrom(main);
  if (icon) a.append(icon);
  const label = document.createElement('span');
  label.className = 'services-label';
  label.textContent = source.textContent.trim();
  const noteText = note && note.textContent.trim();
  if (noteText) {
    const small = document.createElement('small');
    small.textContent = noteText;
    label.append(small);
  }
  a.append(label);
  li.append(a);
  return li;
}

/**
 * @param {Element} block The services block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'services-tiles';
  let form = null;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells[0] && cells[0].textContent.trim().toLowerCase() === 'search' && !cells[0].querySelector('a')) {
      form = searchForm(cells);
      return;
    }
    const li = tile(cells);
    if (li) ul.append(li);
  });
  block.replaceChildren(ul);
  if (!form) return;
  // the search sits with the section heading and intro (left column), before the closing link
  const intro = block.closest('.section')?.querySelector('.default-content-wrapper');
  if (intro) {
    const last = intro.lastElementChild;
    intro.insertBefore(form, last && last.querySelector('a') ? last : null);
  } else {
    block.prepend(form);
  }
}
