// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation } from '../../scripts/scripts.js';

// keep track globally of the number of tab blocks on the page
let tabBlockCnt = 0;

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-timeline-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tablist-${tabBlockCnt += 1}`;

  // the first cell of each row is the title of the tab
  const tabHeadings = [...block.children]
    .filter((child) => child.firstElementChild && child.firstElementChild.children.length > 0)
    .map((child) => child.firstElementChild);

  tabHeadings.forEach((tab, i) => {
    const id = `tabpanel-${tabBlockCnt}-tab-${i + 1}`;

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-timeline-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-timeline-tab';
    button.id = `tab-${id}`;

    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });

    // add the new tab list button, to the tablist
    tablist.append(button);

    // remove the tab heading from the dom, which also removes it from the UE tree
    tab.remove();

    // remove the instrumentation from the button's h1, h2 etc (this removes it from the tree)
    if (button.firstElementChild) {
      moveInstrumentation(button.firstElementChild, null);
    }

    // build the heritage timeline inside the panel
    // eslint-disable-next-line no-use-before-define
    decoratePanel(tabpanel);
  });

  block.prepend(tablist);
}

/**
 * Transforms the flat panel content (intro heading + image, then repeating
 * h4 "YYYY — + Title" / paragraph pairs) into a horizontally scrollable
 * heritage timeline of year cards.
 * @param {Element} panel the tabpanel element
 */
function decoratePanel(panel) {
  const content = panel.firstElementChild || panel;

  // intro group: leading heading(s) and image before the first year entry
  const intro = document.createElement('div');
  intro.className = 'tabs-timeline-intro';

  // timeline scroller that holds the year cards
  const track = document.createElement('div');
  track.className = 'tabs-timeline-track';

  const nodes = [...content.children];
  let currentCard = null;

  nodes.forEach((node) => {
    const isHeading = /^H[1-6]$/.test(node.tagName);
    // a year entry heading starts with a 4-digit year
    const yearMatch = isHeading && node.textContent.trim().match(/^((?:19|20)\d{2})\s*[—–-]?\s*\+?\s*(.*)$/);

    if (yearMatch) {
      const [, yearValue, titleText] = yearMatch;
      // start a new timeline card
      currentCard = document.createElement('div');
      currentCard.className = 'tabs-timeline-card';

      const year = document.createElement('span');
      year.className = 'tabs-timeline-year';
      year.textContent = yearValue;

      const title = document.createElement('h4');
      title.className = 'tabs-timeline-card-title';
      title.textContent = titleText.trim();

      const body = document.createElement('div');
      body.className = 'tabs-timeline-card-body';
      body.append(year, title);

      currentCard.append(body);
      track.append(currentCard);

      // the original year heading is now represented by the card, drop it
      node.remove();
    } else if (currentCard) {
      // description / media following a year heading belongs to the card
      currentCard.querySelector('.tabs-timeline-card-body').append(node);
    } else {
      // intro content (heading + hero image) before any year entry
      intro.append(node);
    }
  });

  content.append(intro, track);
}
