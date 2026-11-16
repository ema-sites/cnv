/* eslint-disable */
/* global WebImporter */

/**
 * Parser: waste-wizard (www.cnv.org, ReCollect "What Goes Where" / collection calendar)
 *
 * Source: #rCw.rCw - markup rendered at runtime by the ReCollect vendor script
 *   (header, tabs, search box, item rows). The importer may hand this parser any piece of
 *   it; the parser climbs to #rCw and emits ONLY the widget configuration (the vendor
 *   script rebuilds everything on the EDS page). Rendered markup is not copied.
 *
 * Configuration is read from what the vendor script left in the page:
 *   iframe.recollect-frame[src*="recollect.net/w/start"]  area, service, root_page
 *   img#rCWidgetView[src*="widget.gif"]                     area, service, type
 *   #rCw[data-widget-layout="pills"]                         tabbed calendar widget
 *
 * Block (key/value rows): area | CityNorthVancouver, name | calendar|wizard,
 * page | tabbed_widget|wizard_search, service | waste.
 */

function readParams(src) {
  try {
    return new URL(src, 'https://www.cnv.org/').searchParams;
  } catch (e) {
    return new URLSearchParams();
  }
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
  if (!element.isConnected) return; // widget already replaced by an earlier piece
  const widget = element.closest('#rCw') || element.closest('.rCw') || element;

  const frame = document.querySelector('iframe.recollect-frame, iframe[src*="recollect.net/w/start"]');
  const pixel = document.querySelector('img#rCWidgetView, img[src*="recollect.net/api/widget.gif"]');
  const fp = readParams(frame ? frame.getAttribute('src') : '');
  const pp = readParams(pixel ? pixel.getAttribute('src') : '');

  const area = fp.get('area') || pp.get('area') || 'CityNorthVancouver';
  const service = fp.get('service') || pp.get('service') || 'waste';
  let page = fp.get('root_page') || pp.get('type') || '';
  if (!page && widget.getAttribute('data-widget-layout') === 'pills') page = 'tabbed_widget';
  if (!page && widget.querySelector('[data-page="calendar"], .rCcalendar')) page = 'tabbed_widget';
  const name = /calendar|tabbed/.test(page) ? 'calendar' : 'wizard';

  const cells = [
    ['area', area],
    ['name', name],
  ];
  if (page) cells.push(['page', page]);
  if (service) cells.push(['service', service]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'waste-wizard', cells });
  replaceContainer(widget, element, block);

  // vendor leftovers outside the widget container
  if (frame && frame.isConnected) frame.remove();
  if (pixel && pixel.isConnected) pixel.remove();
}
