/*
 * Table Data block: data table with a header row and striped body rows.
 * Each authored row is a table row, each cell a table cell. The first row is the header
 * unless the `no-header` option is set (unknown options are ignored).
 * Wrapped in a scroll container so wide tables scroll horizontally on small screens.
 */
export default function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const rows = [...block.children];
  // a one-row table has no body to head (e.g. a contact-info layout table)
  const header = !block.classList.contains('no-header') && rows.length > 1;
  const columnCount = Math.max(1, ...rows.map((r) => r.children.length));

  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const isHeader = i === 0 && header;
    const cells = [...row.children];
    cells.forEach((cell, c) => {
      const td = document.createElement(isHeader ? 'th' : 'td');
      if (isHeader) td.setAttribute('scope', 'col');
      // a short row stretches its last cell over the remaining columns
      if (c === cells.length - 1 && cells.length < columnCount) {
        td.colSpan = columnCount - cells.length + 1;
      }
      // a cell holding a single paragraph keeps its text directly in the cell, as on the source
      const only = cell.children.length === 1 && cell.firstElementChild.localName === 'p'
        && [...cell.childNodes].every((n) => n === cell.firstElementChild || !n.textContent.trim());
      td.append(...(only ? cell.firstElementChild.childNodes : cell.childNodes));
      tr.append(td);
    });
    if (isHeader) thead.append(tr);
    else tbody.append(tr);
  });

  if (thead.children.length) table.append(thead);
  table.append(tbody);

  const scroller = document.createElement('div');
  scroller.className = 'table-data-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  // label the scroll region with the heading directly before the table, if any
  const prev = (block.parentElement || block).previousElementSibling;
  const caption = prev && (prev.matches('h1, h2, h3, h4, h5, h6')
    ? prev : [...prev.querySelectorAll('h1, h2, h3, h4, h5, h6')].pop());
  scroller.setAttribute('aria-label', caption ? caption.textContent.trim() : 'Data table');
  scroller.append(table);
  block.replaceChildren(scroller);
}
