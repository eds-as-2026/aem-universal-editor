/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-hotspot.
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
 * cards-hotspot renders the interactive video-hotspot section (used twice on the
 * page — exterior + interior). It has a section heading + subheading over a hero
 * poster image, plus N hotspot cards (title + subheading + description each).
 *
 * xwalk / md2jcr rule: md2jcr's richtext STOPS at the first inline image and each
 * card only has ONE image field. So the poster image gets its OWN image cell and
 * each hotspot's text lives in its own row's text cell.
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

  // Build a text element from a source node's text (normalizing whitespace).
  const textPara = (node, tag) => {
    if (!node) return null;
    const value = node.textContent.replace(/\s+/g, ' ').trim();
    if (!value) return null;
    const el = document.createElement(tag || 'p');
    el.textContent = value;
    return el;
  };

  // --- Intro card: section heading + subheading over the hero poster image ---
  const heading = element.querySelector('.hot__spot__content--heading');
  const subheading = element.querySelector('.hot__spot__content--desc');
  const posterImg = element.querySelector('.hot__spot__main--img, .hot__spot__main__img--container img');
  const introNodes = [];
  const headingEl = textPara(heading, 'h2');
  const subEl = textPara(subheading, 'p');
  if (headingEl) introNodes.push(headingEl);
  if (subEl) introNodes.push(subEl);
  if (introNodes.length || posterImg) pushCard(posterImg || null, introNodes);

  // --- Hotspot cards: title + subheading + description, one row each ---
  // Desktop hotspot cards; the mobile modal repeats them, so dedupe by title.
  const seen = new Set();
  element
    .querySelectorAll('.hot__spot__card--container')
    .forEach((card) => {
      const title = card.querySelector('.hot__spot__card--title');
      const sub = card.querySelector('.hot__spot__card--subheading');
      const desc = card.querySelector('.hot__spot__card--desc');
      const titleText = title ? title.textContent.replace(/\s+/g, ' ').trim() : '';
      if (!titleText) return;
      if (seen.has(titleText)) return;
      seen.add(titleText);

      const nodes = [];
      const titleEl = textPara(title, 'h3');
      const subEl2 = textPara(sub, 'p');
      const descEl = textPara(desc, 'p');
      if (titleEl) nodes.push(titleEl);
      if (subEl2) nodes.push(subEl2);
      if (descEl) nodes.push(descEl);
      if (nodes.length) pushCard(null, nodes);
    });

  // --- EMPTY-BLOCK GUARD ---
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-hotspot', cells });
  element.replaceWith(block);
}
