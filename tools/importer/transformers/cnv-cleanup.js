/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for www.cnv.org (Sitecore / ASP.NET).
 *
 * beforeTransform: catalog-driven removals only (pageCleanup replay, then
 *   catalog cleanup.rules outside <main>). Site chrome is still in place so the
 *   captured nth-child selectors resolve exactly as they did at catalog time.
 * afterTransform: site chrome removal (header, footer, left navigation,
 *   ASP.NET wrappers, widgets, scripts/styles, hidden inputs) and flattening of
 *   jQuery-UI FAQ accordions into heading + content default content.
 */

// catalog-template.json cleanup.rules[] (empty for this catalog at generation time).
const CATALOG_RULES = [];

function normalizeUrl(u) {
  if (!u) return '';
  try {
    const url = new URL(u);
    return `${url.origin}${url.pathname}`.replace(/\/+$/, '');
  } catch (e) {
    return String(u).split(/[?#]/)[0].replace(/\/+$/, '');
  }
}

function currentPageUrl(element, payload) {
  const p = payload || {};
  return (p.params && p.params.originalURL)
    || p.originalURL
    || p.url
    || (element && element.ownerDocument && element.ownerDocument.location
      && element.ownerDocument.location.href)
    || '';
}

function findPageCleanup(pageCleanup, pageUrl) {
  if (!pageCleanup || typeof pageCleanup !== 'object') return null;
  const target = normalizeUrl(pageUrl);
  if (!target) return null;
  const key = Object.keys(pageCleanup).find((k) => normalizeUrl(k) === target);
  return key ? pageCleanup[key] : null;
}

function safeQueryAll(root, selector) {
  try {
    return [...root.querySelectorAll(selector)];
  } catch (e) {
    return [];
  }
}

function removeAll(root, selector) {
  safeQueryAll(root, selector).forEach((el) => el.remove());
}

function isEmpty(el) {
  return !el.textContent.trim()
    && !el.querySelector('img, picture, video, iframe, table, form, input, select, textarea, svg');
}

function flattenAccordions(root) {
  safeQueryAll(root, 'div.mobile-accordion').forEach((acc) => {
    // drop jQuery-UI decoration icons
    removeAll(acc, 'span.ui-accordion-header-icon, span.ui-icon');
    // turn non-heading accordion headers into real headings
    safeQueryAll(acc, '.ui-accordion-header, [role="tab"]').forEach((hdr) => {
      if (/^H[1-6]$/.test(hdr.tagName)) return;
      const doc = hdr.ownerDocument;
      const h = doc.createElement('h3');
      while (hdr.firstChild) h.appendChild(hdr.firstChild);
      hdr.replaceWith(h);
    });
    // make collapsed panels visible so their text is kept
    safeQueryAll(acc, '*').forEach((el) => {
      ['style', 'aria-hidden', 'hidden', 'aria-expanded', 'aria-selected', 'aria-controls',
        'aria-labelledby', 'role', 'tabindex'].forEach((a) => el.removeAttribute(a));
    });
  });
}

// Same rule as the importer's FileUtils.sanitizePath, which names the imported pages, so a link to
// another cnv.org page points at its migrated path (/City-Hall/Bylaws -> /city-hall/bylaws).
function sanitizeSegment(segment) {
  let s = segment;
  try { s = decodeURIComponent(segment); } catch (e) { /* keep as is */ }
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const FILE_LINK = /\.(pdf|docx?|xlsx?|pptx?|csv|zip|jpe?g|png|gif|svg|mp4|mp3|ashx|txt|rtf)$/i;

function rewriteInternalLinks(root) {
  safeQueryAll(root, 'a[href]').forEach((a) => {
    const href = a.getAttribute('href').trim();
    if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) return;
    let url;
    try { url = new URL(href, 'https://www.cnv.org/'); } catch (e) { return; }
    if (!/^(www\.)?cnv\.org$/i.test(url.hostname)) return;
    // media library files and documents stay on the source until assets are migrated
    if (url.pathname.startsWith('/-/') || url.pathname.startsWith('/CNV/') || FILE_LINK.test(url.pathname)) {
      a.setAttribute('href', `https://www.cnv.org${url.pathname}${url.search}${url.hash}`);
      return;
    }
    const lastDot = url.pathname.lastIndexOf('.');
    const ext = lastDot > url.pathname.lastIndexOf('/') ? url.pathname.slice(lastDot) : '';
    const base = ext ? url.pathname.slice(0, lastDot) : url.pathname;
    const path = base.split('/').filter(Boolean).map(sanitizeSegment).filter(Boolean).join('/');
    a.setAttribute('href', `/${path}${ext.toLowerCase()}${url.search}${url.hash}`);
  });
}

export default function transform(hookName, element, payload) {
  const root = element;

  if (hookName === 'beforeTransform') {
    const template = (payload && payload.template) || {};
    const doc = root.ownerDocument || root;

    // the importer drops empty icon elements before parsing, so keep each notice's icon name and
    // colour as attributes (attributes only: catalog selectors still match)
    safeQueryAll(doc, '.call-out-info').forEach((box) => {
      const icon = box.querySelector('i[class*="fa-"], em[class*="fa-"], span[class*="fa-"], svg[class*="fa-"]');
      if (!icon) return;
      const name = [...icon.classList].find((c) => /^fa-[a-z]/.test(c)
        && !/^fa-(solid|regular|light|thin|duotone|sharp|brands|fw|lg|xs|sm|\dx|w-\d+)/.test(c));
      if (name) box.setAttribute('data-icon', name.replace(/^fa-/, ''));
      const colour = (icon.getAttribute('style') || '').match(/color\s*:\s*([^;]+)/i);
      if (colour) box.setAttribute('data-icon-color', colour[1].trim());
    });
    const pageSelectors = findPageCleanup(template.pageCleanup, currentPageUrl(root, payload));

    if (pageSelectors) {
      // replay per-page cleanup in order; selectors are absolute (html > body ...)
      pageSelectors.forEach((sel) => {
        const matches = safeQueryAll(doc, sel);
        if (matches.length === 1) matches[0].remove();
      });
    } else {
      // generic catalog rules, only for pages not listed in pageCleanup
      CATALOG_RULES.forEach((rule) => {
        const sel = typeof rule === 'string' ? rule : rule && rule.selector;
        if (!sel) return;
        safeQueryAll(doc, sel).forEach((el) => {
          if (!el.closest('main')) el.remove();
        });
      });
    }
    return;
  }

  if (hookName === 'afterTransform') {
    // site header (#mainform > div.container wrapping #header)
    safeQueryAll(root, '#header').forEach((hdr) => {
      const wrap = hdr.parentElement;
      if (wrap && wrap.matches('div.container') && wrap.parentElement
        && wrap.parentElement.matches('#mainform')) {
        wrap.remove();
      } else {
        hdr.remove();
      }
    });
    removeAll(root, '#navbar, .top-menu-wrapper, .top-menu-mega-wrap');

    // site footer (incl. copyright bar)
    removeAll(root, '#footer-background, #footer, div.footer-middle-section, .footer-bottom-section');

    // the iCity e-services portal (DNN, e.g. /Ubill): its own header, login/search strip and menu
    removeAll(root, '#topHeader, #siteWrapper > header, #siteWrapper nav.navbar, .navbar-header, [id*="dnnSEARCH"], [id*="dnnLOGIN"], [id*="dnnUSER"], [id*="dnnMENU"], #siteWrapper > footer, #Footer');

    // left sidebar navigation only; keep other #left-side-column children
    removeAll(root, '#left-side-navigation');

    // widgets: social sharing, Google Translate, cookie/consent overlays
    removeAll(root, '#socialSharing, .addthis_toolbox');
    removeAll(root, '#goog-gt-tt, iframe.skiptranslate, body > div.skiptranslate, [class^="VIpgJd-"], #google_translate_element');
    removeAll(root, '[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], #onetrust-consent-sdk');

    // non-authorable code
    removeAll(root, 'script, style, noscript, link, input[type="hidden"]');

    // empty ASP.NET wrappers and clearfix divs
    safeQueryAll(root, 'div.aspNetHidden, div.clear').forEach((el) => {
      if (isEmpty(el)) el.remove();
    });

    // FAQ accordions stay default content
    flattenAccordions(root);

    // tracking attributes
    safeQueryAll(root, '[onclick], [data-track], [data-analytics]').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-analytics');
    });

    // a stray "%" (e.g. "?w=100%&") is not valid percent-encoding and breaks the importer's URL handling
    safeQueryAll(root, 'img[src], a[href], source[srcset]').forEach((el) => {
      ['src', 'href', 'srcset'].forEach((attr) => {
        const v = el.getAttribute(attr);
        if (v && /%(?![0-9a-f]{2})/i.test(v)) el.setAttribute(attr, v.replace(/%(?![0-9a-f]{2})/gi, '%25'));
      });
    });

    rewriteInternalLinks(root);
  }
}
