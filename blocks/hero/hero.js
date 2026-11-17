/*
 * Hero block: one photograph with the page heading as live text, and an optional featured
 * call-out (a campaign or deadline) on the photo.
 *
 * Authoring (Document Authoring table, block name "Hero"):
 *   row 1: the photo | the heading (h1) and a short intro line
 *   row 2 (optional): the featured call-out: a heading, one line, and a bold link (a button)
 *
 * On phones the call-out would push the next section (the homepage services) below the fold,
 * so a copy of it is shown after that section instead (CSS swaps the two by width).
 */
export default function decorate(block) {
  const [first, ...rest] = [...block.children];
  const media = document.createElement('div');
  media.className = 'hero-media';
  const content = document.createElement('div');
  content.className = 'hero-content';

  if (first) {
    const picture = first.querySelector('picture');
    if (picture) {
      const holder = picture.closest('p');
      media.append(picture);
      if (holder && !holder.textContent.trim() && !holder.children.length) holder.remove();
    }
    [...first.children].forEach((cell) => content.append(...cell.childNodes));
  }

  const inner = document.createElement('div');
  inner.className = 'hero-inner';
  inner.append(content);

  const featured = rest.filter((row) => row.textContent.trim()).map((row) => {
    const aside = document.createElement('aside');
    aside.className = 'hero-featured';
    [...row.children].forEach((cell) => aside.append(...cell.childNodes));
    const heading = aside.querySelector('h2, h3, h4');
    if (heading) {
      heading.id = heading.id || 'hero-featured-heading';
      aside.setAttribute('aria-labelledby', heading.id);
    }
    return aside;
  });
  inner.append(...featured);

  block.replaceChildren(media, inner);

  const section = block.closest('.section');
  const next = section && section.nextElementSibling;
  if (featured.length && next) {
    const band = document.createElement('div');
    band.className = 'hero-featured-band';
    featured.forEach((aside) => {
      const copy = aside.cloneNode(true);
      copy.querySelectorAll('[id]').forEach((el) => { el.id = `${el.id}-m`; });
      if (copy.hasAttribute('aria-labelledby')) copy.setAttribute('aria-labelledby', `${copy.getAttribute('aria-labelledby')}-m`);
      band.append(copy);
    });
    next.after(band);
  }
}
