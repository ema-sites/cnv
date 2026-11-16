/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns (www.cnv.org side-by-side text columns)
 *
 * Sources:
 *   [id$="_pnlResources"].resources-documents   "Related Documents" | "Related Links"
 *       > .resourceSection / .documentSection
 *           > .resourcesTitle / .documentsTitle (column heading) + div > ul (links)
 *   .divRow > .divCell                            authored two-column layout
 *       (e.g. Mayor "Invite the Mayor" | "Request a Certificate")
 *   An info panel ([id$="_pnlInfo"]) holding a .divRow: only the .divRow is replaced.
 *
 * Block: one row, one cell per column (heading and list / text in each).
 *
 * Note: content-page lists no instance selectors for columns in page-templates.json, so
 * the import script does not call this parser for that template yet.
 */

const BLOCK_TAGS = /^(P|UL|OL|DIV|TABLE|H[1-6]|BLOCKQUOTE|PRE|HR|FIGURE|DL)$/;

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
      if (node.tagName === 'DIV') {
        // unwrap layout divs, keep their content
        out.push(...toBlocks([...node.childNodes], document));
        return;
      }
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
  out.forEach((el) => {
    if (el.tagName !== 'P') return;
    while (el.lastChild && ((el.lastChild.nodeType === 1 && el.lastChild.tagName === 'BR')
      || (el.lastChild.nodeType === 3 && !el.lastChild.textContent.trim()))) el.lastChild.remove();
  });
  return out.filter((el) => el.textContent.trim() || el.querySelector('img'));
}

function resourceColumn(document, section) {
  const cell = [];
  const title = section.querySelector('.resourcesTitle, .documentsTitle');
  if (text(title)) {
    const h = document.createElement('h3');
    h.textContent = text(title);
    cell.push(h);
  }
  const lists = [...section.querySelectorAll('ul, ol')].filter((l) => !l.parentElement.closest('ul, ol'));
  lists.forEach((list) => {
    // normalise link text whitespace
    list.querySelectorAll('a').forEach((a) => { a.textContent = text(a); });
    cell.push(list);
  });
  if (!lists.length) {
    cell.push(...toBlocks([...section.childNodes].filter((n) => n !== title), document));
  }
  return cell;
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
  if (!element.isConnected) return;

  let root = element.closest('.resources-documents, [id$="_pnlResources"], .divRow');
  if (!root) root = element.querySelector('.resources-documents, [id$="_pnlResources"], .divRow');
  if (!root) root = element;

  let columns = [];
  if (root.matches('.resources-documents, [id$="_pnlResources"]')) {
    columns = [...root.children]
      .filter((c) => c.matches('.resourceSection, .documentSection') && text(c))
      .map((c) => resourceColumn(document, c));
  } else if (root.matches('.divRow')) {
    columns = [...root.children]
      .filter((c) => c.matches('.divCell') || text(c))
      .map((c) => toBlocks([...c.childNodes], document));
  } else if (root.tagName === 'TABLE') {
    // a layout table (e.g. two photos side by side): one block row per table row, one cell per td
    const rows = [...root.querySelectorAll(':scope > tbody > tr, :scope > tr')]
      .map((tr) => [...tr.children].map((td) => toBlocks([...td.childNodes], document)).filter((c) => c.length))
      .filter((r) => r.length);
    if (!rows.length) return;
    const width = Math.max(...rows.map((r) => r.length));
    rows.forEach((r) => { while (r.length < width) r.push(''); });
    root.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'columns', cells: rows }));
    return;
  } else {
    columns = [...root.children]
      .filter((c) => c.tagName === 'DIV' && text(c))
      .map((c) => toBlocks([...c.childNodes], document));
  }
  columns = columns.filter((c) => c.length);
  if (!columns.length) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells: [columns] });
  replaceContainer(root, element, block);
}
