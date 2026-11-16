/*
 * Council Video Picker block: "Select a date" dropdown that loads a council meeting video.
 * One row per meeting: date label | video link (embed/player URL).
 * An optional first row with a single cell (no link) sets the field label (e.g. "Select a Date").
 * The selected meeting is kept in the `?videoid=` query parameter (or the link itself)
 * so a shared URL reopens the same video.
 */

let pickerId = 0;

function videoKey(href) {
  try {
    const url = new URL(href, window.location.href);
    return url.searchParams.get('videoid') || url.searchParams.get('id') || url.href;
  } catch {
    return href;
  }
}

function toEmbedUrl(href) {
  const url = new URL(href, window.location.href);
  if (/youtu\.be$/.test(url.hostname)) return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
  if (/youtube\.com$/.test(url.hostname) && url.searchParams.get('v')) {
    return `https://www.youtube.com/embed/${encodeURIComponent(url.searchParams.get('v'))}`;
  }
  if (/vimeo\.com$/.test(url.hostname) && !url.hostname.startsWith('player.')) {
    return `https://player.vimeo.com/video/${url.pathname.split('/').filter(Boolean).pop()}`;
  }
  return url.href;
}

export default function decorate(block) {
  pickerId += 1;
  let labelText = 'Select a Date';
  const meetings = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const link = row.querySelector('a[href]');
    if (!link) {
      const text = row.textContent.trim();
      if (text && !meetings.length) labelText = text;
      return;
    }
    const labelCell = cells.find((c) => !c.contains(link) && c.textContent.trim());
    const label = (labelCell || link).textContent.trim();
    meetings.push({ label, href: link.href, key: videoKey(link.href) });
  });

  const id = `council-video-picker-${pickerId}`;
  const field = document.createElement('div');
  field.className = 'council-video-picker-field';
  const labelEl = document.createElement('label');
  labelEl.className = 'council-video-picker-label';
  labelEl.htmlFor = id;
  labelEl.textContent = `${labelText.replace(/\s*:\s*$/, '')}: `;
  const select = document.createElement('select');
  select.id = id;
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a date ...';
  select.append(placeholder);
  meetings.forEach((m, i) => {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = m.label;
    select.append(option);
  });
  field.append(labelEl, select);

  const player = document.createElement('div');
  player.className = 'council-video-picker-player';
  player.setAttribute('aria-live', 'polite');

  const load = (index, updateUrl) => {
    const meeting = meetings[index];
    player.replaceChildren();
    if (!meeting) return;
    const iframe = document.createElement('iframe');
    iframe.src = toEmbedUrl(meeting.href);
    iframe.title = `Council meeting video: ${meeting.label}`;
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
    iframe.loading = 'lazy';
    const frame = document.createElement('div');
    frame.className = 'council-video-picker-frame';
    frame.append(iframe);
    player.append(frame);
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('videoid', meeting.key);
      window.history.replaceState(null, '', url);
    }
  };

  select.addEventListener('change', () => {
    if (select.value === '') {
      player.replaceChildren();
      return;
    }
    load(parseInt(select.value, 10), true);
  });

  block.replaceChildren(field, player);

  // preselect from ?videoid=
  const requested = new URLSearchParams(window.location.search).get('videoid');
  if (requested) {
    const index = meetings.findIndex((m) => m.key.toLowerCase() === requested.toLowerCase()
      || m.href.toLowerCase().includes(requested.toLowerCase()));
    if (index >= 0) {
      select.value = String(index);
      load(index, false);
    }
  }
}
