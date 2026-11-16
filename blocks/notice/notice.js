/*
 * Notice block: bordered callout with an icon and a status message.
 * One row: icon cell (an :icon: span, image or icon name such as "alert", "file-check")
 * | content cell (optional heading, text, optional link).
 * If only one cell is authored, a default alert icon is used.
 * Named icons are drawn as inline SVG (stroke = currentcolor), no icon font is loaded.
 */

const ICON_WORDS = /^[a-z0-9-]{1,30}$/;

// 24x24 outline glyphs, drawn with stroke="currentColor"
const ICONS = {
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r=".6" fill="currentColor"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6" fill="currentColor"/>',
  'file-check': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  pencil: '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/><path d="m15 5 4 4"/>',
  seedling: '<path d="M12 22V11"/><path d="M12 11C12 6.6 8.4 3 4 3H3v1c0 4.4 3.6 8 8 8h1"/><path d="M12 14c0-4.4 3.6-8 8-8h1v1c0 4.4-3.6 8-8 8h-1"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
};
ICONS.edit = ICONS.pencil;
ICONS['exclamation-circle'] = ICONS.alert;
ICONS['circle-exclamation'] = ICONS.alert;
ICONS['info-circle'] = ICONS.info;
ICONS['circle-info'] = ICONS.info;

function iconSvg(name) {
  const paths = ICONS[name] || ICONS.alert;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false">${paths}</svg>`;
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];

  let iconCell = null;
  let contentCell = cells[cells.length - 1];
  if (cells.length > 1) {
    [iconCell] = cells;
    contentCell = cells.slice(1).find((c) => c.textContent.trim()) || cells[1];
  }

  const icon = document.createElement('div');
  icon.className = 'notice-icon';
  icon.setAttribute('aria-hidden', 'true');
  const media = iconCell && iconCell.querySelector('.icon, picture, img, svg');
  const iconName = iconCell && iconCell.textContent.trim().replace(/^:|:$/g, '').toLowerCase();
  if (media) {
    icon.append(media);
  } else {
    let name = 'alert';
    if (iconName && ICON_WORDS.test(iconName)) name = iconName;
    // first cell is text, not an icon
    else if (iconCell && iconCell.textContent.trim()) iconCell = null;
    icon.dataset.icon = name;
    icon.classList.add(`notice-icon-${name}`);
    icon.innerHTML = iconSvg(name);
  }

  const content = document.createElement('div');
  content.className = 'notice-content';
  if (iconCell || cells.length === 1) content.append(...contentCell.childNodes);
  else cells.forEach((c) => content.append(...c.childNodes));
  // further rows are appended to the content
  [...block.children].slice(1).forEach((r) => {
    [...r.children].forEach((c) => content.append(...c.childNodes));
  });

  // loose text (no paragraph) gets wrapped so spacing rules apply
  const blockChild = ':scope > :is(p, h1, h2, h3, h4, h5, h6, ul, ol, div, table)';
  if (content.textContent.trim() && !content.querySelector(blockChild)) {
    const p = document.createElement('p');
    p.append(...content.childNodes);
    content.append(p);
  }

  block.setAttribute('role', 'note');
  block.replaceChildren(icon, content);
}
