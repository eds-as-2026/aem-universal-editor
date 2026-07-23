import { moveInstrumentation } from '../../scripts/scripts.js';

// Variant is authored via the block's "Style" select (classes field). When no
// variant is chosen we default to the product-showcase look.
const VARIANTS = ['product-showcase', 'gallery-marquee', 'dealer-carousel'];

function getVariant(block) {
  const found = VARIANTS.find((v) => block.classList.contains(v));
  return found || 'product-showcase';
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-showcase');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-showcase-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-showcase-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0, behavior = 'smooth') {
  const slides = block.querySelectorAll('.carousel-showcase-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-showcase-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior,
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-showcase-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-showcase-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, id) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-showcase-${id}-slide-${slideIndex}`);
  slide.classList.add('carousel-showcase-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-showcase-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

// Product showcase image cell holds up to 3 grouped pictures (media_ prefix):
// [0] product image, [1] light-theme background, [2] dark-theme background.
// Tag them so CSS can layer the backgrounds behind the product and cross-fade
// them with the theme toggle.
function decorateShowcaseImages(block) {
  block.querySelectorAll('.carousel-showcase-slide-image').forEach((cell) => {
    const pictures = [...cell.querySelectorAll(':scope > picture')];
    // Fallback: pictures may sit inside <p> wrappers from richtext round-trip.
    if (pictures.length === 0) {
      cell.querySelectorAll('p > picture').forEach((p) => pictures.push(p));
    }
    const [product, bgLight, bgDark] = pictures;
    if (product) product.classList.add('carousel-showcase-product-image');
    if (bgLight) bgLight.classList.add('carousel-showcase-bg', 'carousel-showcase-bg-light');
    if (bgDark) bgDark.classList.add('carousel-showcase-bg', 'carousel-showcase-bg-dark');
  });
}

// Interactive light/dark toggle for the product showcase. Matches the original:
// a small control anchored bottom-left that flips the whole block's theme,
// cross-fading the day/night backgrounds.
function addThemeToggle(block) {
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'carousel-showcase-theme-toggle';
  toggle.setAttribute('aria-pressed', 'false');
  toggle.setAttribute('aria-label', 'Switch to dark theme');
  toggle.innerHTML = `
    <span class="carousel-showcase-theme-icon carousel-showcase-theme-icon-sun" aria-hidden="true"></span>
    <span class="carousel-showcase-theme-icon carousel-showcase-theme-icon-moon" aria-hidden="true"></span>
  `;
  toggle.addEventListener('click', () => {
    const isDark = block.classList.toggle('carousel-showcase-theme-dark');
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  });
  block.append(toggle);
}

// Gallery marquee: a continuously auto-scrolling strip of image-only tiles.
// No prev/next, no dots. Slides are cloned once so the scroll loops seamlessly.
function decorateMarquee(block, rows, id) {
  const track = document.createElement('ul');
  track.classList.add('carousel-showcase-slides', 'carousel-showcase-marquee-track');

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, id);
    moveInstrumentation(row, slide);
    track.append(slide);
    row.remove();
  });

  // Clone the set once for a seamless CSS loop (aria-hidden so AT ignores dupes).
  [...track.children].forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('id');
    clone.classList.add('carousel-showcase-slide-clone');
    track.append(clone);
  });

  const viewport = document.createElement('div');
  viewport.classList.add('carousel-showcase-slides-container');
  viewport.append(track);
  block.prepend(viewport);
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  block.setAttribute('id', `carousel-showcase-${id}`);

  const variant = getVariant(block);
  block.dataset.variant = variant;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', variant === 'gallery-marquee' ? 'Image gallery' : 'Carousel');

  const rows = [...block.querySelectorAll(':scope > div')];

  if (variant === 'gallery-marquee') {
    decorateMarquee(block, rows, id);
    return;
  }

  const isSingleSlide = rows.length < 2;

  const container = document.createElement('div');
  container.classList.add('carousel-showcase-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-showcase-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-showcase-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-showcase-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, id);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-showcase-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (variant === 'product-showcase') {
    decorateShowcaseImages(block);
    addThemeToggle(block);
  }

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
