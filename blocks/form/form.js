import { toClassName } from '../../scripts/aem.js';

/*
 * Form block: one web form (text fields, textarea, checkboxes, submit).
 * One row per field:  Label | type | options or placeholder (optional)
 *   - type: text (default), email, tel, number, date, textarea, checkbox, checkboxes,
 *     radio, select, hidden, submit
 *   - a trailing "*" on the label marks the field as required
 *   - options for checkboxes/radio/select: a list in the third cell, or comma-separated
 * Settings rows (first cell is the key): `action` | submit URL, `method` | POST/GET,
 * `thank you` | message shown after a successful submit.
 * A single-cell row is introductory text placed in the form at that position.
 * Option `dark`: colour scheme hook for the design pass.
 */

const SETTINGS = ['action', 'method', 'thank you', 'thankyou', 'success', 'success message'];
const TYPES = ['text', 'email', 'tel', 'number', 'date', 'url', 'textarea', 'checkbox',
  'checkboxes', 'radio', 'select', 'hidden', 'submit', 'password'];
let formId = 0;

function readOptions(cell) {
  if (!cell) return [];
  const items = [...cell.querySelectorAll('li')];
  if (items.length) return items.map((li) => li.textContent.trim()).filter(Boolean);
  const paragraphs = [...cell.querySelectorAll('p')];
  if (paragraphs.length > 1) return paragraphs.map((p) => p.textContent.trim()).filter(Boolean);
  return cell.textContent.split(/[,\n]/).map((t) => t.trim()).filter(Boolean);
}

function uniqueName(base, used) {
  let name = base || 'field';
  let i = 2;
  while (used.has(name)) {
    name = `${base}-${i}`;
    i += 1;
  }
  used.add(name);
  return name;
}

function createChoiceGroup(field, inputType) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = `form-field form-${inputType}-group`;
  const legend = document.createElement('legend');
  legend.textContent = field.label;
  const list = document.createElement('div');
  list.className = 'form-options';
  fieldset.append(legend, list);
  field.options.forEach((option, i) => {
    const id = `${field.id}-${i}`;
    const wrapper = document.createElement('div');
    wrapper.className = `form-${inputType}`;
    const input = document.createElement('input');
    input.type = inputType;
    input.id = id;
    input.name = field.name;
    input.value = option;
    if (inputType === 'radio' && field.required) input.required = true;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = option;
    wrapper.append(input, label);
    list.append(wrapper);
  });
  if (field.required) fieldset.dataset.required = 'true';
  return fieldset;
}

function createField(field) {
  if (field.type === 'checkboxes') return createChoiceGroup(field, 'checkbox');
  if (field.type === 'radio') return createChoiceGroup(field, 'radio');

  if (field.type === 'hidden') {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = field.name;
    input.value = field.extra || '';
    return input;
  }

  const wrapper = document.createElement('div');
  wrapper.className = `form-field form-${field.type}-wrapper`;
  const label = document.createElement('label');
  label.htmlFor = field.id;
  label.textContent = field.label;

  let control;
  if (field.type === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 4;
  } else if (field.type === 'select') {
    control = document.createElement('select');
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = 'Select...';
    control.append(empty);
    field.options.forEach((o) => {
      const option = document.createElement('option');
      option.value = o;
      option.textContent = o;
      control.append(option);
    });
  } else {
    control = document.createElement('input');
    control.type = field.type;
    if (field.type === 'checkbox') control.value = 'yes';
  }
  control.id = field.id;
  control.name = field.name;
  if (field.required) control.required = true;
  if (field.extra && field.type !== 'select' && field.type !== 'checkbox') control.placeholder = field.extra;
  if (field.type === 'email') control.autocomplete = 'email';

  if (field.type === 'checkbox') wrapper.append(control, label);
  else wrapper.append(label, control);
  if (field.required) wrapper.dataset.required = 'true';
  return wrapper;
}

function serialize(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (key in data) data[key] = [].concat(data[key], value);
    else data[key] = value;
  });
  return data;
}

export default function decorate(block) {
  formId += 1;
  const settings = {};
  const items = [];
  const used = new Set();

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const first = cells[0] ? cells[0].textContent.trim() : '';
    const key = first.toLowerCase();
    if (cells.length >= 2 && SETTINGS.includes(key)) {
      const link = cells[1].querySelector('a[href]');
      settings[key.replace(/\s+/g, '')] = link ? link.href : cells[1].textContent.trim();
      return;
    }
    if (cells.length < 2 || !cells[1].textContent.trim()) {
      if (row.textContent.trim()) items.push({ kind: 'text', node: cells[0] });
      return;
    }
    const typeText = toClassName(cells[1].textContent.trim());
    const type = TYPES.includes(typeText) ? typeText : 'text';
    const required = /\*\s*$/.test(first);
    const label = first.replace(/\s*\*\s*$/, '');
    const extraCell = cells[2];
    items.push({
      kind: 'field',
      type,
      label,
      required,
      name: uniqueName(toClassName(label), used),
      id: '',
      options: readOptions(extraCell),
      extra: extraCell ? extraCell.textContent.trim() : '',
    });
  });

  const form = document.createElement('form');
  form.noValidate = false;
  if (settings.action) form.action = settings.action;
  form.method = (settings.method || 'post').toLowerCase() === 'get' ? 'get' : 'post';

  let hasSubmit = false;
  items.forEach((item) => {
    if (item.kind === 'text') {
      item.node.className = 'form-text';
      form.append(item.node);
      return;
    }
    item.id = `form-${formId}-${item.name}`;
    if (item.type === 'submit') {
      hasSubmit = true;
      const button = document.createElement('button');
      button.type = 'submit';
      button.className = 'form-submit button';
      button.textContent = item.extra || item.label || 'Submit';
      const wrapper = document.createElement('div');
      wrapper.className = 'form-field form-submit-wrapper';
      wrapper.append(button);
      form.append(wrapper);
      return;
    }
    form.append(createField(item));
  });

  if (!hasSubmit) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-field form-submit-wrapper';
    wrapper.innerHTML = '<button type="submit" class="form-submit button">Submit</button>';
    form.append(wrapper);
  }

  const status = document.createElement('div');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.append(status);

  form.addEventListener('submit', async (e) => {
    // required checkbox groups: at least one must be ticked
    const missingGroup = [...form.querySelectorAll('fieldset[data-required="true"]')]
      .find((fs) => !fs.querySelector('input:checked'));
    if (missingGroup) {
      e.preventDefault();
      status.textContent = `Please make a selection for "${missingGroup.querySelector('legend').textContent}".`;
      missingGroup.querySelector('input').focus();
      return;
    }
    if (!settings.action || form.method === 'get') return; // native submit
    e.preventDefault();
    const submit = form.querySelector('.form-submit');
    submit.disabled = true;
    status.textContent = '';
    try {
      const resp = await fetch(settings.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: serialize(form) }),
      });
      if (!resp.ok) throw new Error(resp.statusText);
      form.reset();
      form.classList.add('form-submitted');
      status.textContent = settings.thankyou || settings.success || settings.successmessage
        || 'Thank you. Your submission has been received.';
    } catch {
      status.textContent = 'Sorry, something went wrong. Please try again later.';
    } finally {
      submit.disabled = false;
    }
  });

  if (!settings.action) {
    form.addEventListener('submit', (e) => {
      if (e.defaultPrevented) return;
      e.preventDefault();
      status.textContent = settings.thankyou || 'Thank you. Your submission has been received.';
      form.reset();
    });
  }

  block.replaceChildren(form);
}
