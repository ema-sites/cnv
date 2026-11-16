import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Carousel Hero block: full-width homepage image slideshow with dot navigation.
 * One row per slide: image cell | optional content cell (heading, text, link).
 * A slide whose only content is a link makes the whole image clickable.
 * Slides auto-advance (paused on hover/focus and for reduced-motion users).
 */

const AUTOPLAY_MS = 6000;
let carouselId = 0;

function showSlide(block, slideIndex) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  let index = slideIndex;
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  const active = slides[index];
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: active.offsetLeft,
    behavior: 'smooth',
  });
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-hero');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-hero-slide').forEach((aSlide, idx) => {
    const hidden = idx !== slideIndex;
    aSlide.setAttribute('aria-hidden', hidden);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (hidden) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  block.querySelectorAll('.carousel-hero-slide-indicator button').forEach((button, idx) => {
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

function createSlide(row, slideIndex, id) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-hero-${id}-slide-${slideIndex}`;
  slide.className = 'carousel-hero-slide';

  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture, img'));
  if (imageCell) {
    imageCell.className = 'carousel-hero-slide-image';
    slide.append(imageCell);
  }
  const contentCell = cells.find((c) => c !== imageCell && c.textContent.trim());
  if (contentCell) {
    const links = contentCell.querySelectorAll('a[href]');
    const onlyLink = links.length === 1
      && contentCell.textContent.trim() === links[0].textContent.trim();
    if (onlyLink && imageCell) {
      // link-only slide: wrap the image in the link
      const a = links[0].cloneNode(false);
      a.setAttribute('aria-label', links[0].textContent.trim());
      a.append(...imageCell.childNodes);
      imageCell.append(a);
    } else {
      contentCell.className = 'carousel-hero-slide-content';
      slide.append(contentCell);
    }
  }

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.id) slide.setAttribute('aria-labelledby', heading.id);
  return slide;
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-hero-slide-indicator button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const indicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(indicator.dataset.targetSlide, 10));
    });
  });
  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => observer.observe(slide));

  // autoplay
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let paused = false;
  ['mouseenter', 'focusin'].forEach((ev) => block.addEventListener(ev, () => { paused = true; }));
  ['mouseleave', 'focusout'].forEach((ev) => block.addEventListener(ev, () => { paused = false; }));
  setInterval(() => {
    if (paused || document.hidden) return;
    showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
  }, AUTOPLAY_MS);
}

export default function decorate(block) {
  carouselId += 1;
  block.id = block.id || `carousel-hero-${carouselId}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.className = 'carousel-hero-slides-container';
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-hero-slides';

  let indicators;
  let nav;
  if (!isSingleSlide) {
    nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Carousel slide controls');
    indicators = document.createElement('ol');
    indicators.className = 'carousel-hero-slide-indicators';
    nav.append(indicators);

    const buttons = document.createElement('div');
    buttons.className = 'carousel-hero-navigation-buttons';
    buttons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous slide"></button>
      <button type="button" class="slide-next" aria-label="Next slide"></button>
    `;
    container.append(buttons);
  }

  rows.forEach((row, idx) => {
    slidesWrapper.append(createSlide(row, idx, carouselId));
    if (indicators) {
      const li = document.createElement('li');
      li.className = 'carousel-hero-slide-indicator';
      li.dataset.targetSlide = idx;
      li.innerHTML = `<button type="button" aria-label="Show slide ${idx + 1} of ${rows.length}"></button>`;
      indicators.append(li);
    }
    row.remove();
  });

  slidesWrapper.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, true, [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }]));
  });

  container.prepend(slidesWrapper);
  block.replaceChildren(container);
  if (nav) container.append(nav);

  if (!isSingleSlide) bindEvents(block);
}
