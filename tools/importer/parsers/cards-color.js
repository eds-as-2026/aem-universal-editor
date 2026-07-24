/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-color.
 * Base block: cards
 * Source URL: https://www.mgselect.co.in/cyberster
 * Generated: 2026-07-24
 *
 * Library convention (base: cards) — container block. Each row = one card item:
 *   - cell 1: Image or Icon (model field: image / imageAlt) -> field:image
 *   - cell 2: Text content, rich text (model field: text)   -> field:text
 * Either cell may be empty, but the empty cell must still be included so the
 * table stays rectangular (2 columns per row).
 *
 * cards-color is the color-variant picker: 5 layered car images (Flare Red,
 * Irises Cyan, Nuclear Yellow, Andes Grey, Modern Beige). Only the active
 * variant's name is shown in the DOM (.color-variant--title); each variant's
 * name is carried on its <img alt>/title, so the label is taken from there.
 *
 * xwalk / md2jcr rule: md2jcr's richtext STOPS at the first inline image and each
 * card only has ONE image field. So every color's car image lives in its OWN
 * image cell (one card per color) with the color name in a separate text cell.
 */
export default function parse(element, { document }) {
  const cells = [];

  const pushCard = (image, textNodes) => {
    const text = (textNodes || []).filter(Boolean);
    if (!image && text.length === 0) return;

    let imageCell = '';
    if (image) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(' field:image '));
      frag.appendChild(image);
      imageCell = frag;
    }

    let textCell = '';
    if (text.length) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(' field:text '));
      text.forEach((n) => frag.appendChild(n));
      textCell = frag;
    }

    cells.push([imageCell, textCell]);
  };

  // One card per color-variant model (each holds a car image for that color).
  const seen = new Set();
  element.querySelectorAll('.color-variant__models--model').forEach((model) => {
    const img = model.querySelector('.color-variant--images img, picture img, img');
    if (!img) return;
    const src = img.getAttribute('src');
    if (src && seen.has(src)) return;
    if (src) seen.add(src);

    // Color name from the image alt/title.
    const name = (img.getAttribute('alt') || img.getAttribute('title') || '').trim();
    const nodes = [];
    if (name) {
      const label = document.createElement('h3');
      label.textContent = name;
      nodes.push(label);
    }
    pushCard(img, nodes);
  });

  // --- EMPTY-BLOCK GUARD ---
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-color', cells });
  element.replaceWith(block);
}
