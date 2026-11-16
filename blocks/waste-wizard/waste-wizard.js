import { loadScript } from '../../scripts/aem.js';

/*
 * Waste Wizard block: embeds the third-party ReCollect "What Goes Where" / collection
 * calendar widget (vendor script). The widget's title bar, tabs, search box and item links
 * are all rendered by the vendor; nothing is rebuilt here.
 * Key/value rows (all optional):
 *   area    | CityNorthVancouver          (ReCollect area, default CityNorthVancouver)
 *   name    | wizard | calendar           (widget name, default wizard)
 *   page    | tabbed_widget               (ReCollect page, e.g. the tabbed calendar widget)
 *   service | waste                       (ReCollect service)
 *   script  | https://assets.ca.recollect.net/api/widget.js  (vendor script URL)
 * The vendor script reads a single global config, so one widget per page.
 */

const DEFAULT_SCRIPT = 'https://assets.ca.recollect.net/api/widget.js';
const KEYS = ['area', 'name', 'page', 'service', 'script', 'locale'];

function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    if (!KEYS.includes(key)) return;
    const link = cells[1].querySelector('a[href]');
    const value = link ? link.href : cells[1].textContent.trim();
    if (value) config[key] = value;
  });
  return config;
}

export default function decorate(block) {
  const config = readConfig(block);
  // the vendor stylesheet scopes every rule under #rCw, so the container must use that id
  const containerId = 'rCw';
  const container = document.createElement('div');
  container.className = 'waste-wizard-widget';
  container.id = containerId;
  block.replaceChildren(container);

  if (document.querySelectorAll(`#${containerId}`).length > 1) {
    // only one vendor widget per page
    container.removeAttribute('id');
    return;
  }

  let scriptUrl = DEFAULT_SCRIPT;
  if (config.script) {
    try {
      const url = new URL(config.script, window.location.href);
      if (/(^|\.)recollect\.net$/.test(url.hostname)) scriptUrl = url.href;
    } catch {
      // keep default
    }
  }

  const widgetConfig = {
    area: config.area || 'CityNorthVancouver',
    name: config.name || 'wizard',
    container: `#${containerId}`,
  };
  if (config.page) widgetConfig.page = config.page;
  if (config.service) widgetConfig.service = config.service;
  if (config.locale) widgetConfig.locale = config.locale;

  const load = () => {
    // the vendor script reads this global when it executes
    // eslint-disable-next-line no-underscore-dangle
    window._recollect_config = widgetConfig;
    loadScript(scriptUrl);
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: '300px' });
  observer.observe(block);
}
