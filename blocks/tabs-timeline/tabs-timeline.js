// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Heritage timeline — a horizontal scroller of cards. Each block row is one
 * card with two cells: [image, text]. The text cell holds a heading
 * ("YEAR — Title") and a description paragraph. We split the heading into a
 * year label + title so the card can style them separately.
 * @param {Element} block the tabs-timeline block element
 */
export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'tabs-timeline-track';

  [...block.children].forEach((row) => {
    const card = document.createElement('li');
    card.className = 'tabs-timeline-card';
    moveInstrumentation(row, card);

    const [imageCell, textCell] = row.children;

    // Image cell
    if (imageCell) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'tabs-timeline-card-image';
      const picture = imageCell.querySelector('picture, img');
      if (picture) imageWrap.append(picture);
      card.append(imageWrap);
    }

    // Text cell: split the leading "YEAR — Title" heading into year + title.
    const body = document.createElement('div');
    body.className = 'tabs-timeline-card-body';

    if (textCell) {
      const heading = textCell.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const text = heading.textContent.trim();
        const match = text.match(/^((?:19|20)\d{2})\s*[—–-]?\s*\+?\s*(.*)$/);
        if (match) {
          const [, yearValue, titleText] = match;
          const year = document.createElement('span');
          year.className = 'tabs-timeline-year';
          year.textContent = yearValue;
          body.append(year);
          if (titleText) {
            const title = document.createElement('h4');
            title.className = 'tabs-timeline-card-title';
            title.textContent = titleText.trim();
            body.append(title);
          }
        } else {
          const title = document.createElement('h4');
          title.className = 'tabs-timeline-card-title';
          title.textContent = text;
          body.append(title);
        }
        heading.remove();
      }
      // remaining nodes (description paragraphs) follow
      [...textCell.children].forEach((node) => body.append(node));
    }

    card.append(body);
    track.append(card);
    row.remove();
  });

  block.append(track);
}
