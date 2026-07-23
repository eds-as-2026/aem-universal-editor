/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-timeline.
 * Base: container block (one item per heritage card).
 * Source URL: https://www.mgselect.co.in/
 *
 * The source "OUR HERITAGE" section is a horizontal timeline of cards, each
 * with its own image, year, title and description. The original tab/panel
 * chrome (tablist, single "OUR HERITAGE" tab) is not reproduced — there is
 * only one panel, so we render its cards directly.
 *
 * Item model (blocks/tabs-timeline/_tabs-timeline.json, tabs-timeline-item):
 *   - image     (reference) -> cell 1, field hint: image  (imageAlt collapses to <img alt>)
 *   - text      (richtext)  -> cell 2, field hint: text   (year+title heading + description)
 *
 * Each card = one row: [image | text]. The intro heading
 * ("A heritage written in motion.") is emitted as default content before the
 * block. Per-card images map cleanly because each lives in its own item's
 * dedicated image cell (not inline in richtext).
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.timeline-card'));

  // --- EMPTY-BLOCK GUARD ---
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const year = card.querySelector('.model-year');
    const overlay = card.querySelector('.overlay');
    const tooltip = card.querySelector('.timeline-card-tooltip');
    const img = card.querySelector('.timeline-card__picture img, picture img, img');

    // Card title = overlay text minus tooltip text and the decorative "+" span.
    let cardTitle = '';
    if (overlay) {
      const clone = overlay.cloneNode(true);
      clone.querySelectorAll('.timeline-card-tooltip, span').forEach((n) => n.remove());
      cardTitle = clone.textContent.replace(/\s+/g, ' ').trim();
    }
    const description = tooltip ? tooltip.textContent.replace(/\s+/g, ' ').trim() : '';

    // --- CELL 1: image ---
    let imageCell = '';
    if (img) {
      const imageFrag = document.createDocumentFragment();
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(img);
      imageCell = imageFrag;
    }

    // --- CELL 2: text (year+title heading + description) ---
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    const yearValue = year ? year.textContent.trim() : '';
    if (yearValue || cardTitle) {
      const h = document.createElement('h4');
      h.textContent = `${yearValue}${yearValue && cardTitle ? ' — ' : ''}${cardTitle}`;
      textFrag.appendChild(h);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description;
      textFrag.appendChild(p);
    }

    cells.push([imageCell, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-timeline', cells });

  // Intro heading as default content before the block.
  const heading = element.querySelector('.timeline-container__title, h1, h2, h3');
  if (heading && heading.textContent.trim()) {
    const introHeading = document.createElement('h2');
    introHeading.textContent = heading.textContent.trim();
    element.replaceWith(introHeading, block);
  } else {
    element.replaceWith(block);
  }
}
