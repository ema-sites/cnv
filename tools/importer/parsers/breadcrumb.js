/* eslint-disable */
/* global WebImporter */

/**
 * Parser: breadcrumb (www.cnv.org, Sitecore)
 *
 * Source: #breadcrumbs-navigation > .content-width > ul > li
 *   li > a[href]            ancestor page links
 *   li (text only)          current page (last item)
 *   .breadcrumb-separator   icon-only separators (dropped)
 *
 * Block: one cell holding a list of links ending with the current page name.
 *
 * Only acts when the element is (or is inside) #breadcrumbs-navigation. Any other element
 * (pagination, filter header/footer, feature listing ...) is left untouched.
 */
// Put the block where `element` is and drop everything else inside `container`
// (an ancestor of element), so the container ends up holding only the block.
function replaceContainer(container, element, block) {
  if (container === element || !container.contains(element)) {
    container.replaceWith(block);
    return;
  }
  element.replaceWith(block);
  let node = block;
  while (node !== container && node.parentElement) {
    const parent = node.parentElement;
    [...parent.childNodes].forEach((n) => { if (n !== node) n.remove(); });
    node = parent;
  }
}

export default function parse(element, { document }) {
  if (!element.isConnected) return; // already replaced as part of an earlier block
  const nav = element.closest('#breadcrumbs-navigation');
  if (!nav) return;

  const list = document.createElement('ul');
  nav.querySelectorAll('li').forEach((li) => {
    const link = li.querySelector('a[href]');
    const text = (link || li).textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const item = document.createElement('li');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = text;
      item.append(a);
    } else {
      item.textContent = text;
    }
    list.append(item);
  });

  const cells = [[list.children.length ? list : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumb', cells });
  replaceContainer(nav, element, block);
}
