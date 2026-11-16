/* eslint-disable */
/* global WebImporter */

/**
 * Parser: table-data (www.cnv.org data tables: milestones, rates, statistics, documents)
 *
 * Source: table.table (rows in thead / tbody / tfoot; header cells are usually <td>)
 *   Sitecore often emits an empty <tbody> before <thead>; rows are read with table.rows
 *   in document order and empty rows are dropped.
 *
 * The importer may hand this parser a whole info panel ([id$="_pnlInfo"]): only the
 * table(s) inside it are replaced, the rest of the panel stays default content.
 *
 * Block: one row per table row, one cell per column; the first row is the header.
 * Cells spanning several columns are padded with empty cells so the block stays
 * rectangular.
 */

function hasContent(el) {
  return !!(el.textContent.replace(/ /g, ' ').trim() || el.querySelector('img, a[href]'));
}

function tableCells(document, table) {
  const rows = [...table.rows].filter((tr) => tr.closest('table') === table);
  const out = [];
  let width = 0;
  rows.forEach((tr) => {
    const row = [];
    [...tr.cells].forEach((cell) => {
      const content = [...cell.childNodes];
      row.push(content);
      const span = Math.min(parseInt(cell.getAttribute('colspan') || '1', 10) || 1, 20);
      for (let i = 1; i < span; i += 1) row.push('');
    });
    if (!row.length || ![...tr.cells].some(hasContent)) return;
    width = Math.max(width, row.length);
    out.push(row);
  });
  out.forEach((row) => {
    while (row.length < width) row.push('');
  });
  return out;
}

function convert(document, table) {
  const cells = tableCells(document, table);
  if (!cells.length) return null;
  const plain = table.classList && table.classList.contains('noZebraStripes');
  return WebImporter.Blocks.createBlock(document, { name: plain ? 'table-data (no-zebra-stripes)' : 'table-data', cells });
}

export default function parse(element, { document }) {
  if (!element.isConnected) return;

  if (element.tagName === 'TABLE') {
    if (element.parentElement && element.parentElement.closest('table')) return; // nested layout table
    const block = convert(document, element);
    if (block) element.replaceWith(block);
    return;
  }

  // a panel or wrapper: replace only the (outermost) tables inside it
  const tables = [...element.querySelectorAll('table')]
    .filter((t) => !t.parentElement.closest('table'))
    .filter((t) => !t.closest('.mobile-accordion') || t.matches('.table'));
  tables.forEach((table) => {
    const block = convert(document, table);
    if (block) table.replaceWith(block);
  });
}
