/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-timeline.
 * Base block: tabs
 * Source URL: https://www.mgselect.co.in/
 * Generated: 2026-07-23
 *
 * Library convention (base: tabs) — container block, 2 columns:
 *   Row 1: block name.
 *   Each tab = one row: [Tab Label (cell 1), Tab Content (cell 2)].
 *   Cell 2 may contain headings, links, images, and richtext.
 *
 * Item model (blocks/tabs-timeline/_tabs-timeline.json, tabs-timeline-item):
 *   - title            (text)      -> column 1 (tab label). Rendered as the tab button.
 *   - content_heading  (text)      -> column 2, field hint: content_heading
 *   - content_headingType (select) -> COLLAPSED (Type suffix), no hint
 *   - content_image    (reference) -> column 2, field hint: content_image
 *   - content_richtext (richtext)  -> column 2, field hint: content_richtext
 *   The content_* fields share the `content` prefix and live in the same (2nd) cell.
 *
 * Source: cmp-tabs with a tablist (li.cmp-tabs__tab) and matching panels
 * (div.cmp-tabs__tabpanel). Each panel holds a .timeline section: an h2 title
 * plus N .timeline-card slides (year + overlay title + tooltip description + image).
 *
 * Note: timeline images are Dynamic Media / Scene7 URLs; the parser leaves the
 * <img> in its natural content_image slot and the DM/Scene7 transformer rewrites it.
 */
export default function parse(element, { document }) {
  const tabs = Array.from(element.querySelectorAll('li.cmp-tabs__tab, .cmp-tabs__tab'));
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  // --- EMPTY-BLOCK GUARD ---
  if (tabs.length === 0 && panels.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  const count = Math.max(tabs.length, panels.length);
  for (let i = 0; i < count; i += 1) {
    const tab = tabs[i];
    const panel = panels[i];

    // --- COLUMN 1: tab title (tab-label cell; no field hint on the label cell) ---
    const titleLabel = tab ? tab.textContent.trim() : `Tab ${i + 1}`;
    const titleCell = document.createElement('p');
    titleCell.textContent = titleLabel;

    // --- COLUMN 2: content (heading + image + richtext) ---
    const contentFrag = document.createDocumentFragment();

    if (panel) {
      // content_heading: the panel's timeline title.
      const heading = panel.querySelector(
        '.timeline-container__title, h1, h2, h3, h4, h5, h6',
      );
      if (heading) {
        contentFrag.appendChild(document.createComment(' field:content_heading '));
        // Normalize to a heading element so md renders it as a heading.
        const h = document.createElement('h3');
        h.textContent = heading.textContent.trim();
        contentFrag.appendChild(h);
      }

      // Timeline cards: year, title, description, image.
      const cards = Array.from(panel.querySelectorAll('.timeline-card'));

      // content_image: first available card image as the representative image.
      const firstImage = panel.querySelector('.timeline-card__picture img, picture img, img');
      if (firstImage) {
        contentFrag.appendChild(document.createComment(' field:content_image '));
        contentFrag.appendChild(firstImage);
      }

      // content_richtext: the full timeline narrative (each card as year heading +
      // title + description).
      const richParts = [];
      cards.forEach((card) => {
        const year = card.querySelector('.model-year');
        const overlay = card.querySelector('.overlay');
        const tooltip = card.querySelector('.timeline-card-tooltip');

        // Card title = overlay text minus tooltip text and the decorative "+" span.
        let cardTitle = '';
        if (overlay) {
          const clone = overlay.cloneNode(true);
          clone.querySelectorAll('.timeline-card-tooltip, span').forEach((n) => n.remove());
          cardTitle = clone.textContent.replace(/\s+/g, ' ').trim();
        }
        const description = tooltip ? tooltip.textContent.replace(/\s+/g, ' ').trim() : '';

        if (year && year.textContent.trim()) {
          const h = document.createElement('h4');
          h.textContent = `${year.textContent.trim()}${cardTitle ? ` — ${cardTitle}` : ''}`;
          richParts.push(h);
        } else if (cardTitle) {
          const h = document.createElement('h4');
          h.textContent = cardTitle;
          richParts.push(h);
        }
        if (description) {
          const p = document.createElement('p');
          p.textContent = description;
          richParts.push(p);
        }
      });

      if (richParts.length) {
        contentFrag.appendChild(document.createComment(' field:content_richtext '));
        richParts.forEach((node) => contentFrag.appendChild(node));
      }
    }

    cells.push([titleCell, contentFrag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-timeline', cells });
  element.replaceWith(block);
}
