import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards List block
 * One row per item: image cell | body cell (linked title, summary, optional "Learn more" link).
 * Renders a vertical list of horizontal teasers (thumbnail beside the text).
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-list-items';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length || (!row.textContent.trim() && !row.querySelector('picture, img'))) return;
    const li = document.createElement('li');
    li.className = 'cards-list-item';

    cells.forEach((cell) => {
      const onlyImage = cell.querySelector('picture, img') && !cell.textContent.trim();
      cell.className = onlyImage ? 'cards-list-item-image' : 'cards-list-item-body';
      li.append(cell);
    });

    // a body link that stands alone in its paragraph is the call to action
    const body = li.querySelector('.cards-list-item-body');
    if (body) {
      [...body.querySelectorAll('p')].forEach((p) => {
        const link = p.querySelector('a');
        const standalone = link && p.textContent.trim() === link.textContent.trim();
        if (standalone && p !== body.firstElementChild) {
          p.classList.add('cards-list-item-cta');
        }
      });
    }

    // make the image clickable with the item's first link
    const image = li.querySelector('.cards-list-item-image');
    const firstLink = body && body.querySelector('a[href]');
    if (image && firstLink && !image.querySelector('a')) {
      const a = document.createElement('a');
      a.href = firstLink.href;
      a.setAttribute('tabindex', '-1');
      a.setAttribute('aria-hidden', 'true');
      a.append(...image.childNodes);
      image.append(a);
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
  });

  block.replaceChildren(ul);
}
