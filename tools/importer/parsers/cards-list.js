/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-list (www.cnv.org, Sitecore vertical feature listings)
 *
 * Containers (one block per container; a parser handed a piece climbs to it):
 *   [id$="_pnlFeatureRowsListing"].featureRowsListing
 *       .row > #featureRowItem > .featureRowImage (a > img)
 *                              + .featureRowDataContainer (.featureRowTitle a, text / <p>)
 *   [id$="_pnlFeatureListing"].featureListings
 *       [id*="_rptFeatures_pnlFirstItem_"].row / [id*="_pnlSecondPanel_"].row
 *         > .featureItem > .featureImage (a > img)
 *                        + .featureText (.featureTitle a, .featureDescription, .learnMore a)
 *
 * Block: one row per item: image cell | body cell (linked title heading, summary,
 * optional standalone LEARN MORE link).
 */

const BLOCK_TAGS = /^(P|UL|OL|DIV|TABLE|H[1-6]|BLOCKQUOTE|PRE|HR|FIGURE|DL)$/;
const ITEM = '.featureItem, [id="featureRowItem"], .featureRowItem';

function findContainer(element) {
  return element.closest('[id$="_pnlFeatureRowsListing"]')
    || element.closest('[id$="_pnlFeatureListing"]')
    || element.closest('.featureRowsListing, .featureListings');
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
      if (node.textContent.trim() || node.querySelector('img')) out.push(node);
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
  return out.filter((el) => el.textContent.trim() || el.querySelector('img'));
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

function picture(document, src) {
  if (!src || !src.getAttribute('src')) return '';
  const img = document.createElement('img');
  img.src = src.getAttribute('src');
  img.alt = src.getAttribute('alt') || '';
  return img;
}

function itemRow(document, item) {
  const imgWrap = item.querySelector('.featureImage, .featureRowImage');
  const image = picture(document, (imgWrap || item).querySelector('img'));

  const body = [];
  const title = item.querySelector('.featureTitle, .featureRowTitle');
  const titleLink = title && title.querySelector('a[href]');
  const anyLink = item.querySelector('a[href]');
  const label = text(title);
  if (label) {
    const link = titleLink || (imgWrap && imgWrap.querySelector('a[href]')) || anyLink;
    body.push(heading(document, label, link ? link.getAttribute('href') : ''));
  }

  const desc = item.querySelector('.featureDescription');
  if (desc) {
    body.push(...toBlocks([...desc.childNodes], document));
  } else {
    const data = item.querySelector('.featureRowDataContainer, .featureText');
    if (data) {
      const nodes = [...data.childNodes].filter((n) => n !== title
        && !(n.nodeType === 1 && n.matches('.learnMore, .featureRowTitle, .featureTitle')));
      body.push(...toBlocks(nodes, document));
    }
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
  return [image, body];
}

// authored two-column teaser (text beside an image) without Sitecore listing markup
function genericRow(document, element) {
  const img = element.querySelector('img');
  const image = picture(document, img);
  const imgCol = img ? [...element.children].find((c) => c.contains(img)) : null;
  const body = [];
  [...element.children].forEach((col) => {
    if (col === imgCol && !text(col)) return;
    body.push(...toBlocks([...col.childNodes], document));
  });
  return [image, body];
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
  const items = [...container.querySelectorAll(ITEM)]
    .filter((el) => !el.parentElement.closest(ITEM));
  if (container.matches(ITEM)) items.unshift(container);
  items.forEach((item) => {
    const row = itemRow(document, item);
    if (row[0] || row[1].length) cells.push(row);
  });
  if (!cells.length) {
    const row = genericRow(document, container);
    if (row[0] || row[1].length) cells.push(row);
  }
  if (!cells.length) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-list', cells });
  replaceContainer(container, element, block);
}
