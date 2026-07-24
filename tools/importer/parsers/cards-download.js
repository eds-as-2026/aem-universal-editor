/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-download.
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
 * cards-download is the document-download list (Owner's Manual, eManual,
 * Service & Warranty, ATS Booklet). Each item is an icon + a labeled link to a
 * PDF. Each download becomes one card: icon in its own image cell + a labeled
 * anchor (label -> PDF href) in the text cell. Deduped by href (all links reuse
 * the same feature icon, so we must NOT dedupe by icon src).
 *
 * xwalk / md2jcr rule: md2jcr's richtext STOPS at the first inline image and each
 * card only has ONE image field. The feature icon goes in its OWN image cell so
 * the download link in the text cell stays a clean anchor.
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

  // One card per download link, deduped by href.
  const seen = new Set();
  element.querySelectorAll('.quick-action__link a[href], a.quick-action__main[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || seen.has(href)) return;
    seen.add(href);

    // Feature icon (the real raster icon, not the decorative base64 arrow).
    const icon = a.querySelector('.quick-action__image, picture img');

    // Label text: prefer the explicit label span, fall back to the link title.
    const labelSrc = a.querySelector('.quick-action__main-label');
    const label = (labelSrc ? labelSrc.textContent : (a.getAttribute('title') || ''))
      .replace(/\s+/g, ' ')
      .trim();

    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.textContent = label || href;

    pushCard(icon || null, [link]);
  });

  // --- EMPTY-BLOCK GUARD ---
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-download', cells });
  element.replaceWith(block);
}
