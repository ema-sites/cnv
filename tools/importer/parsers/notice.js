/* eslint-disable */
/* global WebImporter */

/**
 * Parser: notice (www.cnv.org, Sitecore)
 *
 * Source: div.call-out-info.call-out-icon > div.call-out-info-columns
 *   > i.fa-*                 Font Awesome status icon (style + icon classes)
 *   > div > div.featureTitle optional heading (often empty)
 *         + text / <p> / links  message
 *
 * Block: one row: icon cell (icon name, e.g. "file-check") | content cell
 * (optional heading, message, links).
 */

const FA_STYLE = /^fa-(solid|regular|light|thin|duotone|sharp|brands|sharp-solid|sharp-regular|sharp-light|fw|lg|xs|sm|[0-9]+x|spin|pulse|border|inverse|flip-.*|rotate-.*|pull-.*|stack.*|w-[0-9]+)$/;
const BLOCK_TAGS = /^(P|UL|OL|DIV|TABLE|H[1-6]|BLOCKQUOTE|PRE|HR|FIGURE|DL)$/;

function iconName(icon) {
  if (!icon) return '';
  const cls = [...icon.classList].find((c) => c.startsWith('fa-') && !FA_STYLE.test(c));
  return cls ? cls.replace(/^fa-/, '') : '';
}

// group loose inline/text nodes into paragraphs, keep block elements as-is
function toBlocks(nodes, document) {
  const out = [];
  let p = null;
  nodes.forEach((node) => {
    if (node.nodeType === 8) return; // comment
    if (node.nodeType === 1 && /^(STYLE|SCRIPT)$/.test(node.tagName)) return;
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
  return out.filter((el) => el.tagName !== 'P' || el.textContent.trim() || el.querySelector('img'));
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
  const root = element.closest('.call-out-info') || element;
  const columns = root.querySelector('.call-out-info-columns') || root;
  const icon = columns.querySelector('i[class*="fa-"], em[class*="fa-"], span[class*="fa-"], svg[class*="fa-"]');
  const body = [...columns.children].find((c) => c !== icon && c.tagName === 'DIV') || columns;

  const content = [];
  const title = body.querySelector('.featureTitle');
  const titleText = title ? title.textContent.replace(/\s+/g, ' ').trim() : '';
  if (titleText) {
    const h = document.createElement('h3');
    h.textContent = titleText;
    content.push(h);
  }
  const rest = [...body.childNodes].filter((n) => n !== title && n !== icon);
  content.push(...toBlocks(rest, document));

  // the cleanup transformer keeps the icon on the box, since the importer drops empty <i> elements
  const cells = [[iconName(icon) || root.getAttribute('data-icon') || 'alert', content]];
  const colour = `${icon ? `${icon.getAttribute('style') || ''} ${icon.getAttribute('color') || ''}` : ''} ${root.getAttribute('data-icon-color') || ''}`.toLowerCase();
  let option = '';
  if (/orange|#f[89a-f][0-9a-f]{2}0|rgb\(2[45]\d,\s*1[2-9]\d/.test(colour)) option = 'orange';
  else if (/green|#228b22|rgb\(34,\s*139/.test(colour)) option = 'green';
  const block = WebImporter.Blocks.createBlock(document, { name: option ? `notice (${option})` : 'notice', cells });
  replaceContainer(root, element, block);
}
