/* eslint-disable */
/* global WebImporter */

/**
 * Parser: form (www.cnv.org)
 *
 * Two source widgets, each becomes ONE form block (a parser handed a piece of the widget
 * - a single field, textarea or checkbox list - climbs to the container):
 *
 *   Sitecore Forms  [data-sc-fxb]
 *     h3 / p                                     intro text (kept as single-cell rows)
 *     .input-wrapper.input-{text,email,tel,date,number,textarea,select,radiolist,
 *                           checkboxlist,checkbox}  label + control
 *       (Sitecore sometimes leaves a wrapper unclosed so later fields nest inside it;
 *        fields are therefore read in document order from their own direct children)
 *     .recaptcha-wrap, hidden inputs              dropped
 *     input[type=submit]                          submit row
 *
 *   Mailchimp embed  #mc_embed_signup
 *     .mc-field-group > label + input            fields (label "*" span = required)
 *     .mc-field-group.input-group > strong + ul  checkbox group
 *     .show > input[type=submit]                 submit row
 *
 * Block rows: Label (trailing * = required) | type | options (list) or placeholder.
 * Single-cell rows (padded) are intro text.
 * Variant: Mailchimp subscription forms (interest checkbox groups, catalog option "dark")
 * are emitted as "form (dark)"; Sitecore forms use the plain "form".
 */

const WIDTH = 3;

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function ownChildren(el, selector) {
  return [...el.children].filter((c) => c.matches(selector));
}

function optionsList(document, labels) {
  const ul = document.createElement('ul');
  labels.filter(Boolean).forEach((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    ul.append(li);
  });
  return ul;
}

function fieldRow(label, type, extra, required) {
  const name = `${label.replace(/\s*\*\s*$/, '').replace(/:\s*$/, '')}${required ? ' *' : ''}`;
  return [name, type, extra || ''];
}

function textRow(node) {
  // drop Sitecore tracking attributes from authored text
  [node, ...node.querySelectorAll('*')].forEach((el) => {
    [...el.attributes].forEach((a) => {
      if (/^data-sc-|^class$/.test(a.name)) el.removeAttribute(a.name);
    });
  });
  const row = [node];
  while (row.length < WIDTH) row.push('');
  return row;
}

function isRequired(control) {
  return !!control && (control.hasAttribute('required')
    || control.hasAttribute('data-val-required')
    || control.getAttribute('aria-required') === 'true'
    || /\brequired\b/.test(control.getAttribute('class') || ''));
}

/* ---------- Sitecore Forms ---------- */

function sitecoreWrapperRow(document, wrapper) {
  const kind = ([...wrapper.classList].find((c) => c.startsWith('input-') && c !== 'input-wrapper') || 'input-text').slice(6);
  const label = ownChildren(wrapper, 'label:not(.mf-lbl-radio):not(.mf-lbl-checkbox)')[0];
  let labelText = text(label);

  if (kind === 'radiolist' || kind === 'checkboxlist') {
    const choices = [...wrapper.querySelectorAll('input[type="radio"], input[type="checkbox"]')]
      .filter((i) => i.closest('.input-wrapper') === wrapper);
    const labels = choices.map((i) => {
      const l = i.closest('label');
      return l ? text(l) : (i.getAttribute('value') || '');
    });
    if (!labelText) labelText = text(wrapper.querySelector('legend')) || 'Options';
    return fieldRow(labelText, kind === 'radiolist' ? 'radio' : 'checkboxes', optionsList(document, labels), choices.some(isRequired));
  }

  const control = ownChildren(wrapper, 'input:not([type="hidden"]), textarea, select')[0];
  if (!control) return null;
  if (!labelText) labelText = control.getAttribute('placeholder') || control.getAttribute('data-sc-field-name') || 'Field';

  if (control.tagName === 'SELECT') {
    const labels = [...control.options].map((o) => text(o)).filter(Boolean);
    return fieldRow(labelText, 'select', optionsList(document, labels), isRequired(control));
  }
  if (control.tagName === 'TEXTAREA') {
    return fieldRow(labelText, 'textarea', control.getAttribute('placeholder') || '', isRequired(control));
  }
  const t = (control.getAttribute('type') || 'text').toLowerCase();
  const type = t === 'checkbox' ? 'checkbox' : (['email', 'tel', 'number', 'date', 'url'].includes(t) ? t : 'text');
  return fieldRow(labelText, type, control.getAttribute('placeholder') || '', isRequired(control));
}

function parseSitecore(document, form) {
  const cells = [];
  const nodes = form.querySelectorAll('.input-wrapper, h1, h2, h3, h4, h5, h6, p, input[type="submit"], button[type="submit"]');
  nodes.forEach((node) => {
    if (node.closest('.recaptcha-wrap')) return;
    if (node.matches('.input-wrapper')) {
      const row = sitecoreWrapperRow(document, node);
      if (row) cells.push(row);
      return;
    }
    if (node.matches('input, button')) {
      const label = node.getAttribute('value') || text(node) || 'Submit';
      cells.push(['Submit', 'submit', label]);
      return;
    }
    // intro / info text outside field wrappers. Sitecore leaves wrappers unclosed, so a section heading
    // can end up nested in an earlier field's wrapper: keep headings unless they belong to a label.
    const isHeading = /^H[1-6]$/.test(node.tagName);
    if (isHeading && node.closest('label, legend')) return;
    if (!isHeading && node.closest('.input-wrapper')) return;
    if (node.parentElement && node.parentElement.closest('p, h1, h2, h3, h4, h5, h6')) return;
    if (!text(node)) return;
    cells.push(textRow(node));
  });
  return cells;
}

/* ---------- Mailchimp ---------- */

function parseMailchimp(document, root) {
  const cells = [];
  const note = root.querySelector('.indicates-required');
  if (text(note)) {
    const p = document.createElement('p');
    p.textContent = text(note);
    cells.push(textRow(p));
  }
  root.querySelectorAll('.mc-field-group').forEach((group) => {
    const boxes = [...group.querySelectorAll('input[type="checkbox"], input[type="radio"]')];
    if (boxes.length) {
      const legend = text(group.querySelector('strong, legend, label:not(li label)')) || 'Options';
      const labels = boxes.map((b) => {
        const li = b.closest('li');
        return text(li) || text(group.querySelector(`label[for="${b.id}"]`)) || b.getAttribute('value') || '';
      });
      const type = boxes[0].type === 'radio' ? 'radio' : 'checkboxes';
      cells.push(fieldRow(legend, type, optionsList(document, labels), boxes.some(isRequired)));
      return;
    }
    const control = group.querySelector('input:not([type="hidden"]), textarea, select');
    if (!control) return;
    const label = group.querySelector('label');
    const required = isRequired(control) || !!(label && label.querySelector('.asterisk'));
    const labelText = (label ? text(label) : '').replace(/\*/g, '').trim() || control.getAttribute('placeholder') || 'Field';
    if (control.tagName === 'SELECT') {
      cells.push(fieldRow(labelText, 'select', optionsList(document, [...control.options].map((o) => text(o))), required));
    } else if (control.tagName === 'TEXTAREA') {
      cells.push(fieldRow(labelText, 'textarea', '', required));
    } else {
      const t = (control.getAttribute('type') || 'text').toLowerCase();
      cells.push(fieldRow(labelText, ['email', 'tel', 'number', 'date', 'url'].includes(t) ? t : 'text', '', required));
    }
  });
  const submit = root.querySelector('input[type="submit"], button[type="submit"]');
  cells.push(['Submit', 'submit', (submit && (submit.getAttribute('value') || text(submit))) || 'Subscribe']);
  const action = root.querySelector('form[action], [action]');
  const href = action && action.getAttribute('action');
  if (href && /^https?:/i.test(href)) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = href;
    cells.push(['action', a, '']);
  }
  return cells;
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
  if (!element.isConnected) return; // form already replaced by an earlier piece
  const sitecore = element.closest('[data-sc-fxb]');
  const mailchimp = element.closest('#mc_embed_signup');
  const container = sitecore || mailchimp;
  if (!container) return;

  const cells = sitecore ? parseSitecore(document, sitecore) : parseMailchimp(document, mailchimp);
  if (!cells.length) return;

  const name = mailchimp ? 'form (dark)' : 'form';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  replaceContainer(container, element, block);
}
