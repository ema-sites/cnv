/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-hero (www.cnv.org homepage banner rotator)
 *
 * Source: #home-banner-background > .container > #home-top-banner.landingSlideshow-wrapper
 *   .slideshowPager            dot navigation (dropped; the block builds its own)
 *   #banners.banners > div     one div per slide: a[href] > img.withShadow
 *                              (optional caption div inside the link is removed by pageCleanup)
 *
 * Block (2 columns): one row per slide: image cell | text cell (any slide heading/text,
 * plus the slide link as a call-to-action). The source link wraps only the image and has
 * no text, so it is rebuilt as a standalone link (a link alone makes the image clickable).
 */

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function labelFromHref(href) {
  try {
    const url = new URL(href, 'https://www.cnv.org/');
    const segments = url.pathname.split('/').filter(Boolean);
    const last = decodeURIComponent(segments[segments.length - 1] || url.hostname);
    const label = last.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim();
    return label || url.hostname;
  } catch (e) {
    return href;
  }
}

export default function parse(element, { document }) {
  const root = element.closest('#home-banner-background') || element;
  const banners = root.querySelector('#banners, .banners') || root;

  const cells = [];
  [...banners.children].forEach((slide) => {
    if (slide.tagName !== 'DIV') return;
    const img = slide.querySelector('img');
    if (!img || !img.getAttribute('src')) return;

    const link = slide.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : '';

    const image = document.createElement('img');
    image.src = img.getAttribute('src');
    image.alt = img.getAttribute('alt') || '';

    const content = [];
    const validHref = href && !/^javascript:/i.test(href);
    // caption overlay (when not removed by pageCleanup): .banner-overlay .title / .subtitle
    const titleText = text(slide.querySelector('.banner-overlay .title, .contentWrapper .title'));
    const subtitleText = text(slide.querySelector('.banner-overlay .subtitle, .contentWrapper .subtitle'));

    if (titleText) {
      const h2 = document.createElement('h2');
      h2.textContent = titleText;
      content.push(h2);
    }
    if (subtitleText) {
      const p = document.createElement('p');
      p.textContent = subtitleText;
      content.push(p);
    }
    if (validHref) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      // with a caption the link is a CTA; alone it makes the whole image clickable
      a.textContent = titleText ? 'Learn more' : (image.alt || labelFromHref(href));
      p.append(a);
      content.push(p);
    }

    cells.push([image, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
