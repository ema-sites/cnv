/* eslint-disable */
/* global WebImporter */

/**
 * Parser: embed-iframe (www.cnv.org embedded pages: YouTube / Vimeo videos, GIS maps,
 * Google Maps, Trumba events calendar)
 *
 * Handled elements:
 *   Trumba "spud" divs (#mainSpudDiv, #monthlistSpudDiv, #tabchooserSpudDiv, #filterSpudDiv,
 *     any [id$="SpudDiv"])   -> ONE calendar embed at the first spud met on the page, the
 *     other spuds are removed. The calendar web name comes from the page's
 *     trumba.com/calendars/<web-name>.rss link (fallback: city-of-north-vancouver).
 *   reCAPTCHA (.recaptcha-wrap, iframe[title="reCAPTCHA"]) -> removed, no block.
 *   iframe[src]               -> embed-iframe block with the src (height / title rows);
 *     the iframe's wrapper (.iframeWrapper, .map-container, ...) is replaced when it holds
 *     nothing else.
 *   info panel ([id$="_pnlInfo"]) or any wrapper -> only the iframes / spuds inside it are
 *     replaced, the rest stays default content.
 *
 * Skipped: the council video picker's player (iframe#myIframe, video_blank.html) which
 * belongs to council-video-picker, ReCollect / Trumba helper frames, empty iframes.
 *
 * Block (key/value rows): url | link to embed; optional height | px, aspect | 16/9, title.
 */

const SPUD = '[id$="SpudDiv"]';
const SKIP_SRC = /video_blank\.html|recollect\.net|google\.com\/recaptcha|trumba\.com\/(?!calendars)|about:blank|syndication\.twitter\.com|platform\.twitter\.com/i;
const VIDEO_SRC = /youtube(-nocookie)?\.com|youtu\.be|vimeo\.com|drive\.google\.com\/file/i;

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function link(document, href) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;
  return a;
}

function absolute(src, document) {
  try {
    return new URL(src, (document.location && document.location.href) || 'https://www.cnv.org/').href;
  } catch (e) {
    return src;
  }
}

function removeRecaptcha(root) {
  const wraps = root.matches && root.matches('.recaptcha-wrap, iframe[title="reCAPTCHA"]')
    ? [root] : [...root.querySelectorAll('.recaptcha-wrap, iframe[title="reCAPTCHA"]')];
  wraps.forEach((el) => {
    const wrap = el.closest('.recaptcha-wrap') || el;
    if (wrap.isConnected) wrap.remove();
  });
}

function trumbaBlock(document) {
  const rss = document.querySelector('a[href*="trumba.com/calendars/"], link[href*="trumba.com/calendars/"]');
  let webName = '';
  if (rss) {
    const m = rss.getAttribute('href').match(/trumba\.com\/calendars\/([^/?#.]+)/i);
    if (m) webName = m[1];
  }
  if (!webName) {
    const scriptText = [...document.querySelectorAll('script')].map((s) => s.textContent).join('\n');
    const m = scriptText.match(/webName\s*:\s*["']([^"']+)["']/);
    if (m) webName = m[1];
  }
  const cells = [
    ['url', link(document, `https://www.trumba.com/calendars/${webName || 'city-of-north-vancouver'}`)],
    ['title', 'Events calendar'],
  ];
  return WebImporter.Blocks.createBlock(document, { name: 'embed-iframe', cells });
}

// the highest wrapper (inside `limit`) whose only content is the iframe
function replaceTarget(iframe, limit) {
  let target = iframe;
  let parent = iframe.parentElement;
  while (parent && parent !== limit && !parent.matches('#page-content, [id$="_pnlInfo"], body, main')) {
    const others = [...parent.childNodes].filter((n) => n !== target
      && ((n.nodeType === 3 && n.textContent.trim())
        || (n.nodeType === 1 && !/^(BR|SCRIPT|STYLE)$/.test(n.tagName) && (text(n) || n.querySelector('img, iframe, video')))));
    if (others.length) break;
    target = parent;
    parent = parent.parentElement;
  }
  return target;
}

function iframeBlock(document, iframe) {
  const src = (iframe.getAttribute('src') || iframe.getAttribute('data-src') || '').trim();
  if (!src || SKIP_SRC.test(src) || iframe.id === 'myIframe') return null;
  const url = absolute(src, document);
  const cells = [['url', link(document, url)]];
  const title = (iframe.getAttribute('title') || '').trim();
  if (VIDEO_SRC.test(url)) {
    cells.push(['aspect', '16/9']);
  } else {
    const raw = (iframe.getAttribute('height') || '').trim();
    const h = parseInt(raw, 10);
    // "100%" (an iframe filling an aspect-ratio wrapper, e.g. a virtual tour) is not a pixel height
    if (/%\s*$/.test(raw) || /height:\s*100%/.test(iframe.getAttribute('style') || '')) {
      // the padding-top wrapper that gives the frame its shape can sit a few levels up
      let pad = null;
      for (let el = iframe.parentElement, i = 0; el && i < 4 && !pad; el = el.parentElement, i += 1) {
        pad = (el.getAttribute('style') || '').match(/padding-(?:top|bottom)\s*:\s*([\d.]+)%/i);
      }
      const ratio = pad ? parseFloat(pad[1]) : 56.25;
      cells.push(['aspect', Math.abs(ratio - 100) < 1 ? '1/1' : (Math.abs(ratio - 75) < 1 ? '4/3' : '16/9')]);
    }
    else if (h && h > 50) cells.push(['height', String(h)]);
  }
  if (title) cells.push(['title', title]);
  return WebImporter.Blocks.createBlock(document, { name: 'embed-iframe', cells });
}

// documents that already received their (single) Trumba calendar embed
const TRUMBA_DONE = new WeakSet();

function handleSpud(document, spud) {
  const all = [...document.querySelectorAll(SPUD)].filter((s) => !s.parentElement.closest(SPUD));
  const first = all[0] || spud;
  if (!TRUMBA_DONE.has(document)) {
    TRUMBA_DONE.add(document);
    first.replaceWith(trumbaBlock(document));
  }
  all.forEach((s) => { if (s.isConnected) s.remove(); });
  if (spud.isConnected) spud.remove();
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
  if (!element.isConnected) return;

  // reCAPTCHA: remove and stop
  if (element.matches('.recaptcha-wrap, iframe[title="reCAPTCHA"]') || element.closest('.recaptcha-wrap')) {
    removeRecaptcha(element.closest('.recaptcha-wrap') || element);
    return;
  }

  // Trumba spud (the element itself or inside one)
  const spud = element.closest(SPUD);
  if (spud) {
    handleSpud(document, spud);
    return;
  }

  if (element.tagName === 'IFRAME') {
    const block = iframeBlock(document, element);
    if (!block) return;
    const target = replaceTarget(element, null);
    replaceContainer(target, element, block);
    return;
  }

  // a panel / wrapper: replace only the embeds inside it
  removeRecaptcha(element);
  const spuds = [...element.querySelectorAll(SPUD)];
  if (spuds.length) handleSpud(document, spuds[0]);
  [...element.querySelectorAll('iframe')].forEach((iframe) => {
    if (!iframe.isConnected || iframe.closest(SPUD)) return;
    const block = iframeBlock(document, iframe);
    if (!block) return;
    const target = replaceTarget(iframe, element);
    replaceContainer(target, iframe, block);
  });
}
