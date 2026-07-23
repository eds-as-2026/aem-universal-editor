/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-luxury.
 * Base block: hero
 * Source URL: https://www.mgselect.co.in/
 * Generated: 2026-07-23
 *
 * Library convention (base: hero) — 1 column, up to 3 rows:
 *   Row 1: block name
 *   Row 2: Background Image (optional)  -> model field: image (imageAlt collapses to <img alt>)
 *   Row 3: Title + Subheading + CTA as text/richtext -> model field: text
 * Never more than 3 rows.
 *
 * Note: The hero image is a Dynamic Media / Scene7 URL. The parser leaves the
 * <img> in its natural `image` slot; the DM/Scene7 transformer rewrites it in
 * afterTransform.
 */
export default function parse(element, { document }) {
  // --- INPUT EXTRACTION (validated against source.html) ---
  // Image lives in .hero__banner__dm__img--container picture > img.hero__banner__dm--img
  const image = element.querySelector(
    'img.hero__banner__dm--img, .hero__banner__dm__img--container img, picture img',
  );

  // Title text: .hero__banner--title contains an <h5> heading.
  const title = element.querySelector(
    '.hero__banner--title h1, .hero__banner--title h2, .hero__banner--title h3, .hero__banner--title h4, .hero__banner--title h5, .hero__banner--title h6, .hero__banner__content--title',
  );

  // CTA links: anchors inside the content CTA wrapper.
  const ctaLinks = Array.from(
    element.querySelectorAll('.hero__banner__content--cta-wrapper a.cta-section__main, .hero__banner__content--cta a'),
  );

  // --- EMPTY-BLOCK GUARD ---
  if (!image && !title && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Clean CTA links: strip decorative icon <img> (base64 svg) and keep text.
  ctaLinks.forEach((a) => {
    a.querySelectorAll('img, .cta-section__icon').forEach((n) => n.remove());
  });

  // --- BUILD CELLS (single-column block, max 3 rows) ---
  const cells = [];

  // Row 2: Background Image (optional)
  if (image) {
    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(' field:image '));
    imageFrag.appendChild(image);
    cells.push([imageFrag]);
  }

  // Row 3: Title + CTA as richtext content
  const textContent = [];
  if (title) textContent.push(title);
  ctaLinks.forEach((a) => textContent.push(a));

  if (textContent.length) {
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    textContent.forEach((node) => textFrag.appendChild(node));
    cells.push([textFrag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-luxury', cells });
  element.replaceWith(block);
}
