/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-gallery (www.cnv.org, Galleria / Flickr photo gallery)
 *
 * Source: [id$="_gallery"].galleria > .galleria-container
 *   .galleria-stage           current slide(s) only (Flickr _b images)
 *   .galleria-thumbnails      every photo as a Flickr _q (square) thumbnail, .active = current
 *   .galleria-bar             fullscreen / play / thumblink buttons + .galleria-info
 *   .galleria-info            counter + caption of the CURRENT photo only
 *
 * The importer may hand this parser any piece of the widget (stage, bar, info, fullscreen,
 * thumbnails). It climbs to the [id$="_gallery"] container, builds ONE block from it and
 * replaces the container; later pieces are detached and are skipped.
 *
 * Block: one row per photo: image cell | caption cell (caption known only for the photo
 * that was current at capture time; the block falls back to the alt text otherwise).
 *
 * Variant: every gallery on the site has the same Galleria markup (dark slideshow stage,
 * caption/counter bar, hidden thumbnail overlay); the default visible view is the dark
 * slideshow stage, so galleries are emitted as "carousel-gallery (dark-grey)".
 */

const VARIANT = 'dark-grey';

// Flickr size suffixes: _s _q _t _m _n _w (small) -> _b (large, 1024px)
function largeFlickr(src) {
  return src.replace(/(staticflickr\.com\/.+?_[0-9a-f]+)_[sqtmnwz](\.(jpe?g|png|gif))/i, '$1_b$2');
}

function photoKey(src) {
  const m = src.match(/\/(\d+)_[0-9a-f]+(?:_[a-z])?\.(?:jpe?g|png|gif)/i);
  return m ? m[1] : src;
}

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
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
  if (!element.isConnected) return; // gallery already replaced by an earlier piece
  const gallery = element.closest('[id$="_gallery"]') || element.closest('.galleria') || element;

  // photos in order: thumbnails list all photos; stage images are a fallback
  const sources = [];
  const seen = new Set();
  const add = (img) => {
    const src = img && img.getAttribute('src');
    if (!src || /^data:/.test(src)) return;
    const key = photoKey(src);
    if (seen.has(key)) return;
    seen.add(key);
    sources.push({ src: largeFlickr(src), alt: img.getAttribute('alt') || '', thumb: img });
  };
  gallery.querySelectorAll('.galleria-thumbnails .galleria-image img').forEach(add);
  if (!sources.length) gallery.querySelectorAll('.galleria-images img, img').forEach(add);

  // caption of the current photo
  const caption = text(gallery.querySelector('.galleria-info-title'))
    || text(gallery.querySelector('.galleria-info-description'));
  let currentIndex = -1;
  const activeThumb = gallery.querySelector('.galleria-thumbnails .galleria-image.active img');
  if (activeThumb) {
    const key = photoKey(activeThumb.getAttribute('src') || '');
    currentIndex = sources.findIndex((s) => photoKey(s.src) === key);
  } else {
    const current = parseInt(text(gallery.querySelector('.galleria-current')), 10);
    if (current > 0 && current <= sources.length) currentIndex = current - 1;
  }

  const cells = sources.map((s, i) => {
    const img = document.createElement('img');
    img.src = s.src;
    const cap = i === currentIndex ? caption : '';
    img.alt = s.alt || cap || '';
    return [img, cap];
  });

  if (!cells.length) {
    // nothing usable (empty widget): drop the leftover widget chrome
    gallery.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: `carousel-gallery (${VARIANT})`, cells });
  replaceContainer(gallery, element, block);
}
