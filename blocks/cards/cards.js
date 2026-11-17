import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const media = div.children.length === 1 && !div.textContent.trim()
        && div.querySelector('picture, img, .icon');
      if (media) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    // when every link in a card goes to the same page and the title carries it, the whole card is
    // the link (the stretched title link keeps one tab stop and one accessible name per card)
    const hrefs = new Set([...li.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
    if (hrefs.size === 1 && li.querySelector(':is(h2, h3, h4) a[href]')) li.classList.add('cards-card-linked');
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
