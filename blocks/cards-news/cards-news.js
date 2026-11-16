/*
 * Cards News block (homepage City News & Events list)
 * One row per news item. Cells (any may be merged into one cell):
 *   linked title | summary | "Read more" link (optional, defaults to the title link)
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-news-items';

  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'cards-news-item';

    const content = document.createElement('div');
    content.className = 'cards-news-item-body';
    [...row.children].forEach((cell) => content.append(...cell.childNodes));

    // normalise loose text and inline elements (e.g. a bare link cell) into paragraphs
    [...content.childNodes].forEach((n) => {
      const isText = n.nodeType === Node.TEXT_NODE && n.textContent.trim();
      const isInline = n.nodeType === Node.ELEMENT_NODE
        && /^(A|STRONG|EM|SPAN|B|I)$/.test(n.tagName);
      if (isText || isInline) {
        const p = document.createElement('p');
        n.replaceWith(p);
        p.append(n);
      }
    });

    const links = [...content.querySelectorAll('a[href]')];
    let title = content.querySelector('h1, h2, h3, h4, h5, h6');
    if (!title && links.length) {
      // first link becomes the title
      const anchor = links[0].closest('p') || links[0];
      title = document.createElement('h3');
      anchor.before(title);
      title.append(links[0]);
      if (anchor !== links[0] && !anchor.textContent.trim()) anchor.remove();
    }
    if (title) title.classList.add('cards-news-item-title');

    // a trailing standalone link (not the title) is the read-more action
    const last = content.lastElementChild;
    const lastLink = last && last.querySelector('a[href]');
    const standalone = lastLink && last.textContent.trim() === lastLink.textContent.trim();
    if (last && last !== title && standalone) {
      last.classList.add('cards-news-item-cta');
    } else {
      const titleLink = title && title.querySelector('a[href]');
      if (titleLink) {
        const cta = document.createElement('p');
        cta.className = 'cards-news-item-cta';
        const a = document.createElement('a');
        a.href = titleLink.href;
        a.textContent = 'Read more';
        a.setAttribute('aria-label', `Read more: ${titleLink.textContent.trim()}`);
        cta.append(a);
        content.append(cta);
      }
    }

    li.append(content);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
