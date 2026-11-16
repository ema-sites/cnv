/* eslint-disable */
/* global WebImporter */

/**
 * Parser: council-video-picker (www.cnv.org council meeting video archives)
 *
 * Two source pickers:
 *   label "Select a Date:" > select#location
 *       option[value=URL] date -> ISI Global mp4 player page
 *       (first option "Select a date ..." -> video_blank.html is the prompt)
 *       followed by div.iframeWrapper > iframe#myIframe (player, src video_blank.html)
 *   span[id$="_lblSelectDate"] "Select a Date:" + select[id$="_dwnVideos"]
 *       option[value={GUID}] "Month D" -> page postback ?videoid=GUID, player
 *       iframe#myIframe src https://download.isiglobal.ca/cnv/YYYY-MM-DD.mp4.html
 *
 * Block: optional first single-cell row = prompt (the picker's label text), then one row
 * per meeting: date label | video link.
 * For [id$="_dwnVideos"] the link is the ISI Global player page built from the year in the
 * page path and the option date, with ?videoid=<id> kept so shared ?videoid= URLs still
 * preselect the meeting; when no date can be derived the page URL ?videoid=<id> is used.
 * The page's player iframe (iframe#myIframe) is part of the picker and is removed.
 */

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december'];

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function link(document, href, label) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label || href;
  return a;
}

function isPrompt(option) {
  const v = (option.getAttribute('value') || '').trim();
  return !v || /video_blank\.html/i.test(v) || /^\{?0{8}-0{4}-0{4}-0{4}-0{12}\}?$/.test(v);
}

function pageUrl(params, document) {
  const u = (params && params.originalURL) || (document.location && document.location.href) || 'https://www.cnv.org/';
  try {
    const url = new URL(u);
    url.search = '';
    url.hash = '';
    return url;
  } catch (e) {
    return new URL('https://www.cnv.org/');
  }
}

function guidKey(value) {
  return value.replace(/[{}-]/g, '').toLowerCase();
}

function isiUrl(year, label) {
  const m = label.toLowerCase().match(/([a-z]+)\.?\s+(\d{1,2})/);
  if (!year || !m) return '';
  const month = MONTHS.findIndex((name) => name.startsWith(m[1].slice(0, 3)));
  if (month < 0) return '';
  return `https://download.isiglobal.ca/cnv/${year}-${String(month + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}.mp4.html`;
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

export default function parse(element, { document, params }) {
  if (!element.isConnected) return;
  const select = element.matches('select') ? element
    : element.querySelector('select#location, select[id$="_dwnVideos"]');
  if (!select) return;

  const isGuidPicker = /_dwnVideos$/.test(select.id || '');
  const label = select.closest('label');
  let labelText = '';
  if (label) {
    labelText = [...label.childNodes].filter((n) => n !== select && n.nodeType === 3)
      .map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
  } else {
    const prev = select.previousElementSibling;
    if (prev && /lblSelectDate/i.test(prev.id || '')) labelText = text(prev);
    else if (select.id) labelText = text(document.querySelector(`label[for="${select.id}"]`));
  }
  labelText = labelText.replace(/\s*:\s*$/, '');

  const options = [...select.querySelectorAll('option')];
  const placeholder = options.find(isPrompt);

  const cells = [];
  const prompt = labelText || text(placeholder);
  if (prompt) cells.push([prompt, '']);

  const url = pageUrl(params, document);
  const yearMatch = url.pathname.match(/\/(\d{4})-Meetings\//i) || url.pathname.match(/\/(\d{4})-Council-Videos/i);
  const year = yearMatch ? yearMatch[1] : '';

  options.forEach((option) => {
    if (isPrompt(option)) return;
    const date = text(option);
    const value = (option.getAttribute('value') || '').trim();
    if (!date || !value) return;
    let href;
    if (isGuidPicker) {
      const key = guidKey(value);
      const isi = isiUrl(year, date);
      if (isi) {
        href = `${isi}?videoid=${key}`;
      } else {
        const page = new URL(url.href);
        page.searchParams.set('videoid', key);
        href = page.href;
      }
    } else {
      try {
        href = new URL(value, url.href).href;
      } catch (e) {
        href = value;
      }
    }
    cells.push([date, link(document, href, date)]);
  });

  if (cells.length <= (prompt ? 1 : 0)) return;

  // the picker's player iframe belongs to the block
  const scope = select.closest('[id$="_pnlInfo"], #page-content') || document;
  scope.querySelectorAll('iframe#myIframe, iframe[src*="video_blank.html"]').forEach((frame) => {
    const wrap = frame.closest('.iframeWrapper');
    (wrap || frame).remove();
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'council-video-picker', cells });
  // replace the label (wrapping the select) or the select's own container line
  let target = label || select;
  if (!label && target.parentElement && target.parentElement.tagName === 'DIV'
    && [...target.parentElement.children].every((c) => c === select || /lblSelectDate/i.test(c.id || ''))) {
    target = target.parentElement;
  }
  replaceContainer(target, element, block);
}
