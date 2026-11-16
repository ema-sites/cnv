/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-media (www.cnv.org, Sitecore 50/50 call-out)
 *
 * Source: div.call-out-5050-anchor > div.call-out-5050-columns[.image-right]
 *   .call-out-5050-image-wrapper  img.visible-xs (mobile copy of the photo) and
 *                                 div.call-out-5050-image (same photo as CSS background)
 *   .call-out-5050-content        .featureTitle (heading) + .call-out-content (text / list / links)
 *
 * Block: one row, two cells: text | image (image-right) or image | text (image left).
 * Variant: when the content panel carries its own inline style attribute (the boxed,
 * coloured text panel), the block is "columns-media (image-left-boxed-text)".
 */

const BLOCK_TAGS = /^(P|UL|OL|DIV|TABLE|H[1-6]|BLOCKQUOTE|PRE|HR|FIGURE|DL)$/;

function toBlocks(nodes, document) {
  const out = [];
  let p = null;
  nodes.forEach((node) => {
    if (node.nodeType === 8) return;
    if (node.nodeType === 1 && /^(STYLE|SCRIPT|LINK)$/.test(node.tagName)) return;
    if (node.nodeType === 1 && BLOCK_TAGS.test(node.tagName)) {
      p = null;
      if (node.textContent.trim() || node.querySelector('img, iframe, table')) out.push(node);
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
  // drop trailing <br> and empty paragraphs
  out.forEach((el) => {
    if (el.tagName !== 'P') return;
    while (el.lastChild && ((el.lastChild.nodeType === 1 && el.lastChild.tagName === 'BR')
      || (el.lastChild.nodeType === 3 && !el.lastChild.textContent.trim()))) el.lastChild.remove();
  });
  return out.filter((el) => el.tagName !== 'P' || el.textContent.trim() || el.querySelector('img'));
}

function bgUrl(el) {
  const style = (el && el.getAttribute('style')) || '';
  const m = style.match(/url\((['"]?)(.*?)\1\)/i) || style.match(/url\(&quot;(.*?)&quot;\)/i);
  if (!m) return '';
  return (m[2] || m[1] || '').replace(/&quot;/g, '');
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
  if (!element.isConnected) return; // already replaced as part of an earlier block
  const root = element.closest('.call-out-5050-anchor') || element.closest('.call-out-5050-columns') || element;
  const columns = root.querySelector('.call-out-5050-columns') || root;

  // image cell
  const imageCell = [];
  const wrapper = columns.querySelector('.call-out-5050-image-wrapper');
  const srcImg = (wrapper || columns).querySelector('img');
  let src = srcImg ? srcImg.getAttribute('src') : '';
  if (!src) src = bgUrl((wrapper || columns).querySelector('.call-out-5050-image'));
  if (src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = (srcImg && srcImg.getAttribute('alt')) || '';
    imageCell.push(img);
  }

  // text cell
  const textCell = [];
  const content = columns.querySelector('.call-out-5050-content');
  const title = content && content.querySelector('.featureTitle');
  const titleText = title ? title.textContent.replace(/\s+/g, ' ').trim() : '';
  if (titleText) {
    const h = document.createElement('h3');
    h.textContent = titleText;
    textCell.push(h);
  }
  const body = content && content.querySelector('.call-out-content');
  if (body) textCell.push(...toBlocks([...body.childNodes], document));

  const imageRight = columns.classList.contains('image-right');
  const row = imageRight ? [textCell, imageCell] : [imageCell, textCell];

  const panelBg = (() => {
    if (!content) return '';
    const inline = content.style && content.style.backgroundColor;
    if (inline) return inline;
    try { return (document.defaultView || window).getComputedStyle(content).backgroundColor || ''; } catch (e) { return ''; }
  })().replace(/\s+/g, '');
  const plainBg = ['', 'transparent', 'rgba(0,0,0,0)', 'rgb(255,255,255)', 'rgb(245,245,245)', '#fff', '#ffffff', 'white'];
  const boxed = !plainBg.includes(panelBg.toLowerCase());
  const name = boxed ? 'columns-media (image-left-boxed-text)' : 'columns-media';
  const block = WebImporter.Blocks.createBlock(document, { name, cells: [row] });
  replaceContainer(root, element, block);
}
