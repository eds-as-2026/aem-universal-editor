/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-spec.
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
 * cards-spec renders the "THE WORLD'S FASTEST MG ROADSTER" performance panel:
 * an intro (heading + description), 5 spec stats (value + label), a disclaimer,
 * and two full-bleed Scene7 layers (sand background + car foreground).
 *
 * xwalk / md2jcr rule: md2jcr's richtext STOPS at the first inline image and each
 * card only has ONE image field. So every image gets its OWN card row in its own
 * dedicated image cell; text-only content lives in a separate row's text cell.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Build a [imageCell, textCell] card row with field hints. Either side may be
  // empty (''), but every row keeps 2 cells so the table stays rectangular.
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

  // --- Intro card: heading + description (text only) ---
  const heading = element.querySelector('.top-features__title, h1, h2, h3');
  const description = element.querySelector('.top-features__subtitle, .top-features__text p');
  const introNodes = [];
  if (heading) introNodes.push(heading);
  if (description) introNodes.push(description);
  if (introNodes.length) pushCard(null, introNodes);

  // --- Spec stat cards: value + label, one row each ---
  // Two <ul.top-features__main> exist (mobile stacked / desktop inline) with the
  // same 5 stats; use the first list only and skip its duplicate.
  const statList = element.querySelector('ul.top-features__main');
  const seenStats = new Set();
  if (statList) {
    statList.querySelectorAll(':scope > li.top-features__item').forEach((li) => {
      const paras = Array.from(li.querySelectorAll('p'));
      // The value <p> may hold "3.2" + <span>SECS</span>; normalize its text.
      const value = paras[0] ? paras[0].textContent.replace(/\s+/g, ' ').trim() : '';
      const label = paras[1] ? paras[1].textContent.replace(/\s+/g, ' ').trim() : '';
      if (!value) return;
      const key = `${value}|${label}`;
      if (seenStats.has(key)) return;
      seenStats.add(key);

      const statFrag = document.createElement('div');
      const valueP = document.createElement('p');
      valueP.textContent = value;
      statFrag.appendChild(valueP);
      if (label) {
        const labelP = document.createElement('p');
        labelP.textContent = label;
        statFrag.appendChild(labelP);
      }
      pushCard(null, [...statFrag.childNodes]);
    });
  }

  // --- Disclaimer card (text only) ---
  const disclaimer = element.querySelector('.top-features__disclaimer p, .top-features__disclaimer');
  if (disclaimer) pushCard(null, [disclaimer]);

  // --- Background + car Scene7 layers: one image card each ---
  const bgImage = element.querySelector('.top-features__bg img, .top-features__bg--image');
  if (bgImage) pushCard(bgImage, null);
  const carImage = element.querySelector('.top-features__car img, .top-features__car--image');
  if (carImage) pushCard(carImage, null);

  // --- EMPTY-BLOCK GUARD ---
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-spec', cells });
  element.replaceWith(block);
}
