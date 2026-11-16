import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Columns Media block: text beside a large photo.
 * One row, two cells (text | image, in either order).
 * Option `image-left-boxed-text`: the photo is shown on the left and the text sits in a panel.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-media-row');
    [...row.children].forEach((cell) => {
      const hasMedia = cell.querySelector('picture, img, video, iframe');
      const onlyMedia = hasMedia && !cell.textContent.trim();
      cell.classList.add(onlyMedia ? 'columns-media-image' : 'columns-media-text');
      // a paragraph holding only one link is a call-to-action line
      cell.querySelectorAll(':scope > p').forEach((p) => {
        const links = p.querySelectorAll('a');
        if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
          p.classList.add('columns-media-link');
        }
      });
    });
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]));
  });
}
