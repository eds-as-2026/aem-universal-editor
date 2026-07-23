/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroLuxuryParser from './parsers/hero-luxury.js';
import carouselShowcaseParser from './parsers/carousel-showcase.js';
import tabsTimelineParser from './parsers/tabs-timeline.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/mgselect-cleanup.js';
import sectionsTransformer from './transformers/mgselect-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'MG Select homepage with hero banner, product showcase carousel, brand manifesto, dealer/showroom carousel, and heritage timeline tabs',
  urls: [
    'https://www.mgselect.co.in/'
  ],
  blocks: [
    {
      name: 'hero-luxury',
      instances: ['div.banner.mg-select-scroller.light-header']
    },
    {
      name: 'carousel-showcase',
      instances: [
        'div.productShowcase.mg-select-scroller.dark-header',
        'div.brandManifesto.mg-select-scroller div.brand-manifesto__gallery',
        'div.carousel.panelcontainer.mg-select-scroller.dark-header'
      ]
    },
    {
      name: 'tabs-timeline',
      instances: ['div.tabs.panelcontainer.mg-header-white.mg-select-scroller']
    }
  ],
  sections: [
    {
      id: 'hero',
      name: 'Hero Banner',
      selector: 'div.banner.mg-select-scroller.light-header',
      style: null,
      blocks: ['hero-luxury'],
      defaultContent: []
    },
    {
      id: 'productShowcase',
      name: 'Product Showcase',
      selector: 'div.productShowcase.mg-select-scroller.dark-header',
      style: null,
      blocks: ['carousel-showcase'],
      defaultContent: []
    },
    {
      id: 'brandManifesto',
      name: 'Brand Manifesto',
      selector: 'div.brandManifesto.mg-select-scroller',
      style: 'light',
      blocks: ['carousel-showcase'],
      defaultContent: ['div.brand-manifesto__content']
    },
    {
      id: 'dealerCarousel',
      name: 'Dealer Carousel',
      selector: 'div.carousel.panelcontainer.mg-select-scroller.dark-header',
      style: null,
      blocks: ['carousel-showcase'],
      defaultContent: []
    },
    {
      id: 'heritageTabs',
      name: 'Heritage Timeline',
      selector: 'div.tabs.panelcontainer.mg-header-white.mg-select-scroller',
      style: 'light',
      blocks: ['tabs-timeline'],
      defaultContent: ['div.timeline-container__container > div.d-flex.flex-column']
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  'hero-luxury': heroLuxuryParser,
  'carousel-showcase': carouselShowcaseParser,
  'tabs-timeline': tabsTimelineParser,
};

// TRANSFORMER REGISTRY
// Order: cleanup (beforeTransform) first; sections runs in afterTransform.
// Images are left as plain <img> tags so AEM ingestion pulls them into the DAM.
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

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

    // 4. afterTransform (section breaks/metadata + DM image rewrite)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path. Map the site root ('/') to '/index' — an
    // empty path sends vfile down a relative-path branch that calls
    // process.cwd(), which throws inside the importer bundle's process shim.
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
