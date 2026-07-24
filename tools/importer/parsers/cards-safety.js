/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-safety.
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
 * cards-safety renders "Safety, Built Into Every Inch": an intro (heading +
 * description), 4 safety feature cards (image + title + description), and a CTA
 * ribbon (title + subtitle + E-BOOK / I-GUIDE links).
 *
 * xwalk / md2jcr rule: md2jcr's richtext STOPS at the first inline image and each
 * card only has ONE image field. So every feature card's image lives in its OWN
 * image cell and its text in a separate text cell; the intro and CTA are
 * text-only cards.
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

  const textEl = (node, tag) => {
    if (!node) return null;
    const value = node.textContent.replace(/\s+/g, ' ').trim();
    if (!value) return null;
    const el = document.createElement(tag || 'p');
    el.textContent = value;
    return el;
  };

  // --- Intro card: section heading + description (text only) ---
  const heading = element.querySelector('.feature-cards__details--title');
  const description = element.querySelector('.feature-cards__details--description');
  const introNodes = [textEl(heading, 'h2'), textEl(description, 'p')].filter(Boolean);
  if (introNodes.length) pushCard(null, introNodes);

  // --- Feature cards: image + title + description, one row each ---
  const seen = new Set();
  element.querySelectorAll('.mg__card--container').forEach((card) => {
    const img = card.querySelector('.mg__card__img--container img, .mg__card--img, picture img');
    const title = card.querySelector('.mg__card--title');
    const desc = card.querySelector('.mg__card--desc');
    // Skip swiper duplicate slides by image src + title.
    const src = img ? img.getAttribute('src') : '';
    const titleText = title ? title.textContent.replace(/\s+/g, ' ').trim() : '';
    const key = `${src}|${titleText}`;
    if (seen.has(key)) return;
    seen.add(key);

    const nodes = [textEl(title, 'h3'), textEl(desc, 'p')].filter(Boolean);
    if (img || nodes.length) pushCard(img || null, nodes);
  });

  // --- CTA ribbon card: title + subtitle + E-BOOK / I-GUIDE links (text only) ---
  const ribbon = element.querySelector('.sticky-ribbon');
  if (ribbon) {
    const nodes = [];
    const rTitle = textEl(ribbon.querySelector('.sticky-ribbon__title'), 'h3');
    const rSub = textEl(ribbon.querySelector('.sticky-ribbon__subtitle'), 'p');
    if (rTitle) nodes.push(rTitle);
    if (rSub) nodes.push(rSub);
    const seenHref = new Set();
    ribbon.querySelectorAll('.sticky-ribbon__cta a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || seenHref.has(href)) return;
      seenHref.add(href);
      const label = a.querySelector('.cta-section__label');
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = (label ? label.textContent : a.textContent).replace(/\s+/g, ' ').trim() || href;
      nodes.push(link);
    });
    if (nodes.length) pushCard(null, nodes);
  }

  // --- EMPTY-BLOCK GUARD ---
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-safety', cells });
  element.replaceWith(block);
}
