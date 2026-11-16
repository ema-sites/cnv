/* eslint-disable */
/* global WebImporter */

/**
 * Parser: listing-filter (www.cnv.org listing filter bars)
 *
 * Sources (one block each; the GO button is part of the block):
 *   div.filterHeader   news releases, bid notices, awards, map catalogue:
 *       select (first option with empty value = label, e.g. "Year", "Category"),
 *       input#txtSearch.watermark (keyword box), a#btnGo.buttonFilter "GO",
 *       optional hint text (kept as default content after the block)
 *   div.importedBylaws div.greyBackground   bylaw search:
 *       strong "BY KEYWORD" + input + button "GO", strong "BY NUMBER" + input + button "GO"
 *
 * Block rows: select | label | options (list); keyword | placeholder; button | GO.
 * Hidden selects (display:none) are not part of the visible filter and are skipped.
 */

const SELECT_LABELS = [
  [/year/i, 'Year'],
  [/status/i, 'Status'],
  [/categor/i, 'Category'],
  [/type/i, 'Type'],
];

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function hidden(el) {
  return /display\s*:\s*none/i.test(el.getAttribute('style') || '') || el.hidden;
}

function titleCase(s) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function selectRow(document, select) {
  const options = [...select.querySelectorAll('option')];
  const first = options[0];
  let label = '';
  if (first && !(first.getAttribute('value') || '').trim()) label = text(first);
  if (!label) {
    const key = `${select.id || ''} ${select.getAttribute('name') || ''}`;
    const hit = SELECT_LABELS.find(([re]) => re.test(key));
    label = hit ? hit[1] : 'Filter';
  }
  const ul = document.createElement('ul');
  options.forEach((o) => {
    if (!(o.getAttribute('value') || '').trim()) return;
    const t = text(o);
    if (!t) return;
    const li = document.createElement('li');
    li.textContent = t;
    ul.append(li);
  });
  return ['select', label, ul];
}

// label shown for a keyword input: preceding <strong>/<label> text, else placeholder
function keywordLabel(input, labels) {
  const own = input.getAttribute('placeholder') || input.getAttribute('title') || '';
  if (own) return own;
  const id = input.id || '';
  const forLabel = id && input.ownerDocument.querySelector(`label[for="${id}"]`);
  if (forLabel) return text(forLabel);
  // nearest preceding strong label in document order
  let best = '';
  labels.forEach((l) => {
    if (l.compareDocumentPosition(input) & 4) best = text(l);
  });
  if (best) return titleCase(best.replace(/:\s*$/, ''));
  if (/number/i.test(id)) return 'Search by number';
  return 'Type in keyword(s) here';
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
  const root = element.closest('div.filterHeader')
    || element.closest('div.importedBylaws div.greyBackground')
    || element.closest('.greyBackground')
    || element;

  const cells = [];
  const labels = [...root.querySelectorAll('strong, b')];
  let buttonText = '';
  root.querySelectorAll('select, input, a.buttonFilter, a.button, button').forEach((ctrl) => {
    if (ctrl.tagName === 'SELECT') {
      if (!hidden(ctrl)) cells.push(selectRow(document, ctrl));
      return;
    }
    if (ctrl.tagName === 'INPUT') {
      const type = (ctrl.getAttribute('type') || 'text').toLowerCase();
      if (['text', 'search', ''].includes(type) && !hidden(ctrl)) {
        cells.push(['keyword', keywordLabel(ctrl, labels), '']);
      } else if (['submit', 'button'].includes(type) && !buttonText) {
        buttonText = ctrl.getAttribute('value') || '';
      }
      return;
    }
    if (!buttonText) buttonText = text(ctrl);
  });
  if (!cells.length) return;
  cells.push(['button', buttonText || 'GO', '']);

  // hint text inside the filter bar (e.g. "Include a year, keyword(s), or both ...")
  const hints = [...root.children].filter((c) => c.tagName === 'DIV'
    && !c.querySelector('select, input, button, a.button')
    && text(c));

  const block = WebImporter.Blocks.createBlock(document, { name: 'listing-filter', cells });
  replaceContainer(root, element, block);
  let last = block;
  hints.forEach((h) => {
    const p = document.createElement('p');
    p.textContent = text(h);
    last.after(p);
    last = p;
  });
}
