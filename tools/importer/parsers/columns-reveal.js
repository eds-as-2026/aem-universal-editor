/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-reveal.
 * Base block: columns
 * Source URL: https://www.mgselect.co.in/cyberster
 * Generated: 2026-07-24
 *
 * Library convention (base: columns) — first row is the block name; the second
 * row has one cell per column, each holding text/images/inline elements.
 * Additional rows must keep the same column count. NO field-hint comments
 * (columns blocks carry only default content). Model template: columns: 2, rows: 1.
 *
 * columns-reveal is the image-reveal sequence: a title ("Touch to Reveal the
 * Invisible"), a base/main image, and an overlay image layered on top. The DOM
 * also repeats the main image several times as decorative "glitch" copies —
 * these are deduped so only the two distinct reveal images survive.
 *
 * Layout: one content row, two columns:
 *   - Column 1: title + base (main) image
 *   - Column 2: overlay image
 * Each image is the sole content of its own column cell (never inline in a
 * richtext with another image), satisfying the md2jcr single-image rule.
 */
export default function parse(element, { document }) {
  // Title text (optional).
  const titleSrc = element.querySelector('.image__reveal--title, .image__reveal__content--container');
  let titleEl = null;
  if (titleSrc) {
    const value = titleSrc.textContent.replace(/\s+/g, ' ').trim();
    if (value) {
      titleEl = document.createElement('p');
      titleEl.textContent = value;
    }
  }

  // Overlay image: the layered reveal image (distinct from the base image).
  const overlayImg = element.querySelector('.image__reveal--overlay, .image__reveal--image.z-2 img');

  // Base/main image: the first reveal image that is NOT the overlay. Dedupe by
  // src so the repeated glitch copies do not add extra images.
  let baseImg = null;
  const overlaySrc = overlayImg ? overlayImg.getAttribute('src') : null;
  const allImgs = Array.from(element.querySelectorAll('.image__reveal--img, .image__reveal--image img, .image__reveal__glitch--img img'));
  for (const img of allImgs) {
    if (img === overlayImg) continue;
    const src = img.getAttribute('src');
    if (src && src === overlaySrc) continue;
    baseImg = img;
    break;
  }

  const col1 = [];
  if (titleEl) col1.push(titleEl);
  if (baseImg) col1.push(baseImg);

  const col2 = [];
  if (overlayImg) col2.push(overlayImg);

  // Empty-block guard.
  if (col1.length === 0 && col2.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[col1, col2]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-reveal', cells });
  element.replaceWith(block);
}
