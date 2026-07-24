/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-drivemode.
 * Base block: tabs (container block — one item/row per drive mode).
 * Source URL: https://www.mgselect.co.in/cyberster
 * Generated: 2026-07-24
 *
 * Library convention (base: tabs): 2 columns, first row = block name; each
 * subsequent row = one tab: cell 1 = Tab Label, cell 2 = Tab Content (may hold
 * headings, links, images, richtext).
 *
 * Item model (blocks/tabs-drivemode/_tabs-drivemode.json, tabs-drivemode-item):
 *   - title             (text)      -> cell 1, field:title (the tab/mode label)
 *   - content_heading   (text)      -> cell 2 group, field:content_heading
 *   - content_headingType (select)  -> COLLAPSED (Type suffix) — no hint
 *   - content_image     (reference) -> cell 2 group, field:content_image
 *   - content_richtext  (richtext)  -> cell 2 group, field:content_richtext
 * All content_* fields share the "content_" prefix and group into the one
 * content cell.
 *
 * The dark "Dial Into The Drive" section presents the drive-mode switcher with a
 * background thumbnail, heading + description, and a LAUNCH MODE button. The
 * source renders a single active mode entry, so one item row is produced.
 *
 * xwalk / md2jcr rule: the single content_image is its own field within the
 * grouped cell (its own field hint), so it never collides with the richtext.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Mode label(s): the mode button(s) in the CTA container.
  const modeButtons = Array.from(
    element.querySelectorAll('.driving-mode__content--cta .cta-section__label, .driving-mode__content--cta button'),
  );
  const primaryLabel = modeButtons.length
    ? modeButtons[0].textContent.replace(/\s+/g, ' ').trim()
    : '';

  // Section heading + description (shared content for the mode panel).
  const headingSrc = element.querySelector('.driving-mode__content--title');
  const descSrc = element.querySelector('.driving-mode__content--description');
  const bgImage = element.querySelector('.driving-mode__bg--image, .driving-mode__bg picture img');

  const heading = headingSrc ? headingSrc.textContent.replace(/\s+/g, ' ').trim() : '';
  const description = descSrc ? descSrc.textContent.replace(/\s+/g, ' ').trim() : '';

  // --- EMPTY-BLOCK GUARD ---
  if (!primaryLabel && !heading && !description && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // --- CELL 1: tab title (mode label) ---
  const titleFrag = document.createDocumentFragment();
  titleFrag.appendChild(document.createComment(' field:title '));
  const titleP = document.createElement('p');
  titleP.textContent = primaryLabel || heading || 'Mode';
  titleFrag.appendChild(titleP);

  // --- CELL 2: grouped content_ fields (heading + image + richtext) ---
  const contentFrag = document.createDocumentFragment();
  if (heading) {
    contentFrag.appendChild(document.createComment(' field:content_heading '));
    const h = document.createElement('h3');
    h.textContent = heading;
    contentFrag.appendChild(h);
  }
  if (bgImage) {
    contentFrag.appendChild(document.createComment(' field:content_image '));
    contentFrag.appendChild(bgImage);
  }
  if (description) {
    contentFrag.appendChild(document.createComment(' field:content_richtext '));
    const p = document.createElement('p');
    p.textContent = description;
    contentFrag.appendChild(p);
  }

  cells.push([titleFrag, contentFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-drivemode', cells });
  element.replaceWith(block);
}
