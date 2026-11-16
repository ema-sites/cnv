import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Carousel Gallery block: one photo gallery (the source's Galleria "twelve" theme).
 * One row per photo: image cell | caption cell (optional, falls back to the image alt text).
 * Parts of the one block:
 * - stage: cross-fading slides with prev/next arrows (shown on hover/focus), swipe and arrow keys
 * - bar: thumbnail-grid toggle, play/pause, popout (lightbox), "n / total" counter + caption,
 *   fullscreen toggle
 * - thumbnail grid: overlays the stage when toggled; a thumbnail shows that photo
 * Option classes (`light`, `dark-grey`, `thumbnails`) name the catalogued parts; they all render
 * the same gallery.
 */

let galleryId = 0;
const PLAY_INTERVAL = 5000;

function imgOf(picture) {
  if (!picture) return null;
  return picture.tagName === 'IMG' ? picture : picture.querySelector('img');
}

function optimize(picture, width, eager) {
  const img = imgOf(picture);
  if (!img) return picture;
  const url = new URL(img.src, window.location.href);
  if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) {
    if (!eager) img.loading = 'lazy';
    return picture;
  }
  return createOptimizedPicture(img.src, img.alt, eager, [{ width }]);
}

/** Thumbnail image: Flickr square size (`_q`) as the source used, otherwise a small rendition. */
function thumbnail(picture) {
  const img = imgOf(picture);
  const flickr = img && /staticflickr\.com\/.+_[a-z]\.jpg$/i.test(img.src);
  if (flickr) {
    const thumb = document.createElement('img');
    thumb.src = img.src.replace(/_[a-z]\.jpg$/i, '_q.jpg');
    thumb.alt = '';
    thumb.loading = 'lazy';
    thumb.width = 150;
    thumb.height = 150;
    return thumb;
  }
  const copy = optimize(picture.cloneNode(true), '300', false);
  const copyImg = imgOf(copy);
  if (copyImg) copyImg.alt = '';
  return copy;
}

function readSlides(block) {
  return [...block.children].map((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
    const picture = imageCell && (imageCell.querySelector('picture') || imageCell.querySelector('img'));
    const captionCell = cells.find((c) => c !== imageCell && c.textContent.trim());
    let title = '';
    let description = '';
    if (captionCell) {
      const parts = [...captionCell.children].filter((el) => el.textContent.trim());
      if (parts.length > 1) {
        title = parts[0].innerHTML.trim();
        description = parts.slice(1).map((el) => el.innerHTML.trim()).join(' ');
      } else title = (parts[0] || captionCell).innerHTML.trim();
    }
    if (!title && picture) {
      const img = imgOf(picture);
      title = img && img.alt ? img.alt : '';
    }
    return { picture, title, description };
  }).filter((s) => s.picture);
}

function button(className, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = className;
  btn.setAttribute('aria-label', label);
  return btn;
}

export default function decorate(block) {
  galleryId += 1;
  const slidesData = readSlides(block);
  if (!slidesData.length) {
    block.replaceChildren();
    return;
  }
  const total = slidesData.length;
  block.id = block.id || `carousel-gallery-${galleryId}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Gallery');
  block.setAttribute('aria-label', 'Photo gallery');
  block.tabIndex = -1;

  // stage
  const stage = document.createElement('div');
  stage.className = 'carousel-gallery-stage';
  const slides = document.createElement('ul');
  slides.className = 'carousel-gallery-slides';
  slidesData.forEach((data, i) => {
    const li = document.createElement('li');
    li.className = 'carousel-gallery-slide';
    li.id = `${block.id}-slide-${i}`;
    li.setAttribute('aria-roledescription', 'slide');
    li.setAttribute('aria-label', `${i + 1} of ${total}`);
    li.append(optimize(data.picture, '1200', i === 0));
    slides.append(li);
  });
  stage.append(slides);
  const prev = button('carousel-gallery-prev', 'Previous photo');
  const next = button('carousel-gallery-next', 'Next photo');
  if (total > 1) stage.append(prev, next);

  // thumbnail grid (overlays the stage)
  const thumbsContainer = document.createElement('div');
  thumbsContainer.className = 'carousel-gallery-thumbnails-container';
  thumbsContainer.id = `${block.id}-thumbnails`;
  const grid = document.createElement('ul');
  grid.className = 'carousel-gallery-thumbnails';
  slidesData.forEach((data, i) => {
    const li = document.createElement('li');
    const btn = button('carousel-gallery-thumbnail', `Show photo ${i + 1} of ${total}`);
    btn.dataset.index = i;
    btn.append(thumbnail(data.picture));
    li.append(btn);
    grid.append(li);
  });
  thumbsContainer.append(grid);

  // bar
  const bar = document.createElement('div');
  bar.className = 'carousel-gallery-bar';
  const thumbLink = button('carousel-gallery-thumblink', 'Show thumbnails');
  thumbLink.setAttribute('aria-expanded', 'false');
  thumbLink.setAttribute('aria-controls', thumbsContainer.id);
  const play = button('carousel-gallery-play', 'Play slideshow');
  play.setAttribute('aria-pressed', 'false');
  const popout = button('carousel-gallery-popout', 'Open photo in a lightbox');
  const fullscreenBtn = button('carousel-gallery-fullscreen', 'Toggle fullscreen');
  fullscreenBtn.setAttribute('aria-pressed', 'false');

  const info = document.createElement('div');
  info.className = 'carousel-gallery-info';
  const counter = document.createElement('div');
  counter.className = 'carousel-gallery-counter';
  counter.setAttribute('aria-live', 'polite');
  const currentEl = document.createElement('span');
  currentEl.className = 'carousel-gallery-current';
  const totalEl = document.createElement('span');
  totalEl.className = 'carousel-gallery-total';
  totalEl.textContent = total;
  counter.append(currentEl, ' / ', totalEl);
  const infoText = document.createElement('div');
  infoText.className = 'carousel-gallery-info-text';
  const infoTitle = document.createElement('div');
  infoTitle.className = 'carousel-gallery-info-title';
  const infoDescription = document.createElement('div');
  infoDescription.className = 'carousel-gallery-info-description';
  infoText.append(infoTitle, infoDescription);
  info.append(counter, infoText);

  bar.append(thumbLink, play, popout, info, fullscreenBtn);

  // popout lightbox
  const dialog = document.createElement('dialog');
  dialog.className = 'carousel-gallery-lightbox';
  dialog.setAttribute('aria-label', 'Photo');
  const dialogClose = button('carousel-gallery-lightbox-close', 'Close');
  const dialogImg = document.createElement('img');
  dialog.append(dialogClose, dialogImg);

  block.replaceChildren(stage, thumbsContainer, bar, dialog);

  let current = 0;
  const show = (index) => {
    current = (index + total) % total;
    [...slides.children].forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', !active);
    });
    currentEl.textContent = current + 1;
    infoTitle.innerHTML = slidesData[current].title;
    infoDescription.innerHTML = slidesData[current].description;
    grid.querySelectorAll('.carousel-gallery-thumbnail').forEach((t, i) => {
      if (i === current) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
  };

  // slideshow
  let timer = null;
  const setPlaying = (on) => {
    clearInterval(timer);
    timer = on ? setInterval(() => show(current + 1), PLAY_INTERVAL) : null;
    play.setAttribute('aria-pressed', on);
    play.setAttribute('aria-label', on ? 'Pause slideshow' : 'Play slideshow');
    block.classList.toggle('is-playing', on);
  };
  const go = (index) => {
    if (timer) setPlaying(true); // restart the interval after manual navigation
    show(index);
  };

  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  play.addEventListener('click', () => setPlaying(!timer));
  block.addEventListener('keydown', (e) => {
    if (e.target.closest('dialog')) return;
    if (e.key === 'ArrowLeft') go(current - 1);
    if (e.key === 'ArrowRight') go(current + 1);
  });

  let touchX = null;
  stage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  // thumbnail grid
  const setThumbs = (open) => {
    block.classList.toggle('is-thumbnails-open', open);
    thumbLink.setAttribute('aria-expanded', open);
    thumbLink.setAttribute('aria-label', open ? 'Hide thumbnails' : 'Show thumbnails');
  };
  thumbLink.addEventListener('click', () => setThumbs(!block.classList.contains('is-thumbnails-open')));
  grid.addEventListener('click', (e) => {
    const thumb = e.target.closest('.carousel-gallery-thumbnail');
    if (!thumb) return;
    go(parseInt(thumb.dataset.index, 10));
    setThumbs(false);
    thumbLink.focus();
  });

  // popout
  popout.addEventListener('click', () => {
    const img = imgOf(slides.children[current].querySelector('picture, img'));
    if (!img) return;
    dialogImg.src = img.currentSrc || img.src;
    dialogImg.alt = img.alt;
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
  });
  dialogClose.addEventListener('click', () => {
    if (dialog.close) dialog.close(); else dialog.removeAttribute('open');
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog && dialog.close) dialog.close();
  });

  // fullscreen (Fullscreen API, CSS fallback)
  const isFullscreen = () => document.fullscreenElement === block || block.classList.contains('is-fullscreen');
  const setFullscreen = async (on) => {
    if (on) {
      if (block.requestFullscreen) {
        try { await block.requestFullscreen(); } catch { block.classList.add('is-fullscreen'); }
      } else block.classList.add('is-fullscreen');
    } else {
      if (document.fullscreenElement === block) await document.exitFullscreen();
      block.classList.remove('is-fullscreen');
    }
    fullscreenBtn.setAttribute('aria-pressed', isFullscreen());
  };
  fullscreenBtn.addEventListener('click', () => setFullscreen(!isFullscreen()));
  document.addEventListener('fullscreenchange', () => {
    fullscreenBtn.setAttribute('aria-pressed', isFullscreen());
  });
  block.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && block.classList.contains('is-fullscreen')) setFullscreen(false);
  });

  show(0);
}
