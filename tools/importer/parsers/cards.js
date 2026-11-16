/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards (www.cnv.org, Sitecore feature listings shown as a grid)
 *
 * Containers (one block per container; a parser handed a piece climbs to it):
 *   [id$="_pnlFeatureListingInfo"]  wrapper of .featured-grid (icon tiles)
 *   .featureCTAs                    image tiles: .featureItem > .featureImage + .featureText
 *   .featureListingsThreeColumn     three-column tiles: .featureItem (image or icon, title, text)
 *   .featured-grid                  icon tiles: a[href] > .grid-item-icon + .grid-item-title
 *   [id$="_pnlFeatureListing"]      generic Sitecore feature listing
 *
 * Block: one row per card: image cell | body cell (linked title heading, description,
 * LEARN MORE link). Icon-only tiles get an empty image cell.
 */

const CONTAINER = '.featureCTAs, .featureListingsThreeColumn, .featured-grid';
const BLOCK_TAGS = /^(P|UL|OL|DIV|TABLE|H[1-6]|BLOCKQUOTE|PRE|HR|FIGURE|DL)$/;

function findContainer(element) {
  const info = element.closest('[id$="_pnlFeatureListingInfo"]');
  if (info) return info;
  // authored listings can nest one container in another: use the outermost one
  let container = element.closest(CONTAINER);
  while (container && container.parentElement && container.parentElement.closest(CONTAINER)) {
    container = container.parentElement.closest(CONTAINER);
  }
  return container || element.closest('[id$="_pnlFeatureListing"]');
}

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function toBlocks(nodes, document) {
  const out = [];
  let p = null;
  nodes.forEach((node) => {
    if (node.nodeType === 8) return;
    if (node.nodeType === 1 && /^(STYLE|SCRIPT)$/.test(node.tagName)) return;
    if (node.nodeType === 1 && BLOCK_TAGS.test(node.tagName)) {
      p = null;
      if (node.textContent.trim()) out.push(node);
      return;
    }
    if (node.nodeType === 1 && node.tagName === 'BR' && !p) return;
    if (!p) {
      if (node.nodeType === 3 && !node.textContent.trim()) return;
      p = document.createElement('p');
      out.push(p);
    }
    p.append(node);
  });
  return out.filter((el) => el.textContent.trim());
}

function heading(document, label, href) {
  const h = document.createElement('h3');
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    h.append(a);
  } else {
    h.textContent = label;
  }
  return h;
}

function imageCell(document, item) {
  const src = item.querySelector('img');
  if (!src || !src.getAttribute('src')) return '';
  const img = document.createElement('img');
  img.src = src.getAttribute('src');
  img.alt = src.getAttribute('alt') || '';
  return img;
}

// .featureItem (featureCTAs / featureListingsThreeColumn)
function featureItemRow(document, item) {
  const body = [];
  const title = item.querySelector('.featureTitle');
  const titleLink = title && title.querySelector('a[href]');
  const firstLink = item.querySelector('a[href]');
  const label = text(title);
  if (label) body.push(heading(document, label, (titleLink || firstLink) ? (titleLink || firstLink).getAttribute('href') : ''));

  const desc = item.querySelector('.featureDescription');
  if (desc) {
    body.push(...toBlocks([...desc.childNodes], document));
  } else {
    [...item.querySelectorAll('p')].forEach((p) => {
      if (title && title.contains(p)) return;
      if (!p.textContent.trim()) return;
      body.push(p);
    });
  }

  const more = item.querySelector('.learnMore a[href]');
  if (more) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = more.getAttribute('href');
    a.textContent = text(more) || 'Learn More';
    p.append(a);
    body.push(p);
  }
  return [imageCell(document, item), body];
}

// .featured-grid > a (icon tile)
function gridItemRow(document, tile) {
  const label = text(tile.querySelector('.grid-item-title')) || text(tile);
  const href = tile.getAttribute('href') || (tile.querySelector('a[href]') || { getAttribute: () => '' }).getAttribute('href');
  return ['', [heading(document, label, href)]];
}

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
  if (!element.isConnected) return; // container already replaced by an earlier piece
  const container = findContainer(element) || element;

  const cells = [];
  const featureItems = [...container.querySelectorAll('.featureItem')]
    .filter((el) => !el.parentElement.closest('.featureItem'));
  if (featureItems.length) {
    featureItems.forEach((item) => {
      const row = featureItemRow(document, item);
      if (row[1].length || row[0]) cells.push(row);
    });
  } else {
    const grid = container.matches('.featured-grid') ? container : container.querySelector('.featured-grid');
    const tiles = grid ? [...grid.children].filter((c) => c.tagName === 'A' || c.querySelector('.grid-item-title')) : [];
    tiles.forEach((tile) => {
      if (text(tile)) cells.push(gridItemRow(document, tile));
    });
  }

  if (!cells.length) return;
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  replaceContainer(container, element, block);
}
