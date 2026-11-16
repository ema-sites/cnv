/*
 * Breadcrumb block
 * Authored: one cell holding a list (or paragraphs) of links, last item is the current page.
 * If the block is empty, the trail is derived from the URL path.
 */

function titleFromSegment(segment) {
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function itemsFromContent(block) {
  const items = [];
  const listItems = block.querySelectorAll('li');
  if (listItems.length) {
    listItems.forEach((li) => {
      const link = li.querySelector('a');
      items.push({ text: (link || li).textContent.trim(), href: link ? link.href : null });
    });
    return items;
  }
  // links and plain text in paragraphs, optionally separated by >, /, | or ›
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_ALL);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A') {
      items.push({ text: node.textContent.trim(), href: node.href });
    } else if (node.nodeType === Node.TEXT_NODE && !node.parentElement.closest('a')) {
      node.textContent.split(/[>/|›»]/).map((t) => t.trim()).filter(Boolean)
        .forEach((text) => items.push({ text, href: null }));
    }
    node = walker.nextNode();
  }
  return items;
}

function itemsFromPath() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const items = [{ text: 'Home', href: '/' }];
  let path = '';
  segments.forEach((segment, i) => {
    path += `/${segment}`;
    const last = i === segments.length - 1;
    const heading = document.querySelector('main h1');
    items.push({
      text: last && heading ? heading.textContent.trim() : titleFromSegment(segment),
      href: last ? null : path,
    });
  });
  return items;
}

export default function decorate(block) {
  let items = itemsFromContent(block).filter((item) => item.text);
  if (!items.length) items = itemsFromPath();

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  ol.className = 'breadcrumb-list';

  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'breadcrumb-item';
    const isLast = i === items.length - 1;
    if (item.href && !isLast) {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.text;
      li.append(a);
    } else {
      const span = document.createElement('span');
      span.textContent = item.text;
      if (isLast) span.setAttribute('aria-current', 'page');
      li.append(span);
    }
    ol.append(li);
  });

  nav.append(ol);
  block.replaceChildren(nav);
}
