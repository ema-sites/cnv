// Header: reads every label, link and image from the nav fragment (content/nav.plain.html) and only
// adds layout, the search form and the open/close behaviour.
const isDesktop = window.matchMedia('(width >= 900px)');

/** Loads the nav fragment: /content first (local preview), then the site root (DA/EDS). */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // Document Authoring wraps the label of a list item that has a sub-list in a paragraph
  // (<li><p><a>…</a></p><ul>…); unwrap it so every menu item is <li><a>…</a>…</li>
  wrapper.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
  // fragment images are relative to the fragment, not the page
  const base = resp.url.replace(/[^/]*$/, '');
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|\/|data:)/.test(src)) img.src = new URL(src, base).href;
  });
  return wrapper;
}

function chevron() {
  const span = document.createElement('span');
  span.className = 'nav-chevron';
  span.setAttribute('aria-hidden', 'true');
  return span;
}

/** Mobile-only copy of a menu label linking to its page (on phones the label itself toggles). */
function overviewItem(link) {
  const li = document.createElement('li');
  li.className = 'nav-overview';
  const a = document.createElement('a');
  a.href = link.getAttribute('href');
  a.textContent = link.textContent.trim();
  li.append(a);
  return li;
}

/** Closes every open top-level panel. */
function closeAll(sections, except) {
  sections.querySelectorAll(':scope > ul > li[aria-expanded="true"]').forEach((li) => {
    if (li !== except) li.setAttribute('aria-expanded', 'false');
  });
}

/** Marks one second-level item as the one whose links show in the panel's right area. */
function activate(item) {
  item.parentElement.querySelectorAll(':scope > li').forEach((li) => {
    li.classList.toggle('nav-active', li === item);
  });
}

function decorateSections(sections) {
  const top = sections.querySelector(':scope > ul');
  if (!top) return;
  top.querySelectorAll(':scope > li').forEach((topItem) => {
    const panel = topItem.querySelector(':scope > ul');
    const link = topItem.querySelector(':scope > a');
    if (!panel || !link) return;
    topItem.classList.add('nav-drop');
    topItem.setAttribute('aria-expanded', 'false');
    link.append(chevron());
    panel.classList.add('nav-panel');

    panel.querySelectorAll(':scope > li').forEach((item) => {
      const links = item.querySelector(':scope > ul');
      if (links) {
        item.classList.add('nav-has-links');
        links.classList.add('nav-panel-links');
        item.querySelector(':scope > a')?.append(chevron());
      }
      item.addEventListener('mouseenter', () => { if (isDesktop.matches) activate(item); });
      item.querySelector(':scope > a')?.addEventListener('focus', () => activate(item));
    });
    const first = panel.querySelector(':scope > li');
    if (first) activate(first);

    topItem.addEventListener('mouseenter', () => {
      if (!isDesktop.matches) return;
      closeAll(sections, topItem);
      topItem.setAttribute('aria-expanded', 'true');
    });
    topItem.addEventListener('mouseleave', () => {
      if (!isDesktop.matches) return;
      topItem.setAttribute('aria-expanded', 'false');
      if (first) activate(first);
    });
    link.addEventListener('focus', () => {
      if (!isDesktop.matches) return;
      closeAll(sections, topItem);
      topItem.setAttribute('aria-expanded', 'true');
    });

    // mobile (as on the source): tapping a row expands it in place; the row's own page moves to an
    // overview link at the top of its sub-list
    const toggleTop = (e) => {
      if (isDesktop.matches) return;
      e.preventDefault();
      const open = topItem.getAttribute('aria-expanded') === 'true';
      closeAll(sections);
      topItem.setAttribute('aria-expanded', open ? 'false' : 'true');
    };
    link.addEventListener('click', toggleTop);
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle-sub';
    toggle.setAttribute('aria-label', `Show ${link.textContent.trim()} menu`);
    toggle.addEventListener('click', toggleTop);
    link.after(toggle);
    panel.prepend(overviewItem(link));

    panel.querySelectorAll(':scope > li.nav-has-links').forEach((item) => {
      const itemLink = item.querySelector(':scope > a');
      const links = item.querySelector(':scope > .nav-panel-links');
      links.prepend(overviewItem(itemLink));
      itemLink.addEventListener('click', (e) => {
        if (isDesktop.matches) return;
        e.preventDefault();
        item.classList.toggle('nav-mobile-open');
      });
    });
  });
}

/** Builds the search form from the fragment's search link and icon. */
function buildSearch(tools) {
  const searchPara = [...tools.querySelectorAll('p')].find((p) => p.querySelector('a[href*="search"] img'));
  if (!searchPara) return null;
  const searchLink = searchPara.querySelector('a');
  const icon = searchLink.querySelector('img');
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.action = searchLink.getAttribute('href');
  form.method = 'get';
  form.setAttribute('role', 'search');
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = icon.alt || 'Search';
  input.setAttribute('aria-label', icon.alt || 'Search');
  const button = document.createElement('button');
  button.type = 'submit';
  button.setAttribute('aria-label', icon.alt || 'Search');
  icon.alt = '';
  button.append(icon);
  form.append(input, button);
  searchPara.replaceWith(form);
  return form;
}

function toggleMenu(nav, force) {
  const open = force ?? nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  const button = nav.querySelector('.nav-hamburger button');
  button?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const [brand, sections, tools] = [...fragment.children];
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  if (brand) {
    brand.className = 'nav-brand';
    const logos = brand.querySelectorAll('p');
    logos[0]?.classList.add('nav-logo-desktop');
    logos[1]?.classList.add('nav-logo-mobile');
  }
  if (tools) {
    tools.className = 'nav-tools';
    tools.querySelector(':scope > ul')?.classList.add('nav-utility');
    buildSearch(tools);
  }
  if (sections) {
    sections.className = 'nav-sections';
    decorateSections(sections);
  }

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = '<button type="button" aria-controls="nav" aria-label="Open navigation"><span class="nav-hamburger-icon"></span></button>';
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));

  const topRow = document.createElement('div');
  topRow.className = 'nav-top';
  if (brand) topRow.append(brand);
  topRow.append(hamburger);
  if (tools) topRow.append(tools);
  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  if (sections) bar.append(sections);
  nav.append(topRow, bar);

  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (sections) closeAll(sections);
    if (!isDesktop.matches) toggleMenu(nav, false);
  });

  // crossing the breakpoint resets both the mobile menu and any open desktop panel
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    if (sections) closeAll(sections);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);
}
