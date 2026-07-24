/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroLuxuryParser from './parsers/hero-luxury.js';
import cardsSpecParser from './parsers/cards-spec.js';
import cardsHotspotParser from './parsers/cards-hotspot.js';
import columnsRevealParser from './parsers/columns-reveal.js';
import tabsDrivemodeParser from './parsers/tabs-drivemode.js';
import cardsSafetyParser from './parsers/cards-safety.js';
import cardsColorParser from './parsers/cards-color.js';
import carouselShowcaseParser from './parsers/carousel-showcase.js';
import cardsDownloadParser from './parsers/cards-download.js';

// TRANSFORMER IMPORTS (site-wide, shared with homepage)
import cleanupTransformer from './transformers/mgselect-cleanup.js';
import sectionsTransformer from './transformers/mgselect-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'product-cyberster',
  description: 'MG Cyberster product detail page',
  urls: [
    'https://www.mgselect.co.in/cyberster'
  ],
  blocks: [
    {
      name: 'hero-luxury',
      instances: [
        'div.product-banner.light-header.mg-select-scroller',
        'div.banner.mg-select-scroller.light-header:nth-of-type(2)',
        'div.banner.mg-select-scroller.light-header:nth-of-type(8)',
        'div.mg-container.responsivegrid.mg-select-scroller.hide-header div.textImage'
      ]
    },
    { name: 'cards-spec', instances: ['div.topFeatures.mg-select-scroller.light-header'] },
    {
      name: 'cards-hotspot',
      instances: [
        'div.interactiveVideoHotspots.mg-select-scroller.light-header:nth-of-type(4)',
        'div.interactiveVideoHotspots.mg-select-scroller.light-header:nth-of-type(7)'
      ]
    },
    { name: 'columns-reveal', instances: ['div.imageReveal.light-header.mg-select-scroller'] },
    { name: 'tabs-drivemode', instances: ['div.drivingMode.light-header.mg-select-scroller'] },
    { name: 'cards-safety', instances: ['div.featureCards.mg-header-white.mg-select-scroller'] },
    { name: 'cards-color', instances: ['div.colorVariant.mg-select-scroller.light-header'] },
    { name: 'carousel-showcase', instances: ['div.artGallery.mg-select-scroller.dark-header'] },
    { name: 'cards-download', instances: ['div.mg-container.responsivegrid.mg-select-scroller.hide-header div.genericContainer'] }
  ],
  sections: [
    {
      id: 'driving-mode',
      name: 'Driving Mode',
      selector: 'div.drivingMode.light-header.mg-select-scroller',
      style: 'dark',
      blocks: ['tabs-drivemode'],
      defaultContent: []
    },
    {
      id: 'art-gallery',
      name: 'Art Gallery',
      selector: 'div.artGallery.mg-select-scroller.dark-header',
      style: 'dark',
      blocks: ['carousel-showcase'],
      defaultContent: []
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  'hero-luxury': heroLuxuryParser,
  'cards-spec': cardsSpecParser,
  'cards-hotspot': cardsHotspotParser,
  'columns-reveal': columnsRevealParser,
  'tabs-drivemode': tabsDrivemodeParser,
  'cards-safety': cardsSafetyParser,
  'cards-color': cardsColorParser,
  'carousel-showcase': carouselShowcaseParser,
  'cards-download': cardsDownloadParser,
};

// TRANSFORMER REGISTRY
// Images are left as plain <img> tags so AEM ingestion pulls them into the DAM
// (same approach as the homepage; no DM carrier-anchor transformer here).
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path.
    let rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '');
    if (rawPath === '') rawPath = '/index';
    const path = WebImporter.FileUtils.sanitizePath(rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
