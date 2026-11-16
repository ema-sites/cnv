import { loadScript } from '../../scripts/aem.js';

/*
 * Embed Iframe block: embeds an external page (video player, interactive map, calendar).
 * Row 1: link to the page to embed.
 * Optional rows (key | value): `height` (px, e.g. 800) or `aspect` (e.g. 16/9), `title`.
 * Trumba calendar links (https://www.trumba.com/calendars/<web-name>) load the Trumba
 * "spud" script instead of a plain iframe, since Trumba sizes its own iframe.
 */

let embedId = 0;

function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const link = row.querySelector('a[href]');
    if (link && !config.url) {
      config.url = link.href;
      return;
    }
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      if (key) config[key] = value;
    } else if (!config.url && /^https?:\/\//.test(row.textContent.trim())) {
      config.url = row.textContent.trim();
    }
  });
  return config;
}

function embedTrumba(block, url) {
  const webName = url.pathname.split('/').filter(Boolean).pop();
  const id = `embed-iframe-trumba-${embedId}`;
  const container = document.createElement('div');
  container.className = 'embed-iframe-trumba';
  container.id = id;
  block.append(container);
  loadScript('https://www.trumba.com/scripts/spuds.js').then(() => {
    if (window.$Trumba) window.$Trumba.addSpud({ webName, spudId: id, spudType: 'main' });
  });
}

function embedIframe(block, url, config) {
  const frame = document.createElement('div');
  frame.className = 'embed-iframe-frame';
  const iframe = document.createElement('iframe');
  iframe.src = url.href;
  iframe.title = config.title || `Content from ${url.hostname}`;
  iframe.loading = 'lazy';
  iframe.setAttribute('allow', 'accelerometer; autoplay; fullscreen; gyroscope; picture-in-picture; encrypted-media; geolocation');

  const height = parseInt(config.height, 10);
  if (height) {
    frame.classList.add('embed-iframe-fixed');
    frame.style.height = `${height}px`;
  } else if (config.aspect && /^\d+(\.\d+)?\s*[/:]\s*\d+(\.\d+)?$/.test(config.aspect)) {
    frame.style.aspectRatio = config.aspect.replace(':', '/');
  }
  frame.append(iframe);
  block.append(frame);
}

export default function decorate(block) {
  embedId += 1;
  const config = readConfig(block);
  block.replaceChildren();
  if (!config.url) return;

  let url;
  try {
    url = new URL(config.url, window.location.href);
  } catch {
    return;
  }

  const load = () => {
    if (block.classList.contains('embed-iframe-is-loaded')) return;
    block.classList.add('embed-iframe-is-loaded');
    if (/(^|\.)trumba\.com$/.test(url.hostname) && url.pathname.includes('/calendars/')) {
      embedTrumba(block, url);
    } else {
      embedIframe(block, url, config);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: '200px' });
  observer.observe(block);
}
