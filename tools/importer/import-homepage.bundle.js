/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-luxury.js
  function parse(element, { document }) {
    const image = element.querySelector(
      "img.hero__banner__dm--img, .hero__banner__dm__img--container img, picture img"
    );
    const title = element.querySelector(
      ".hero__banner--title h1, .hero__banner--title h2, .hero__banner--title h3, .hero__banner--title h4, .hero__banner--title h5, .hero__banner--title h6, .hero__banner__content--title"
    );
    const ctaLinks = Array.from(
      element.querySelectorAll(".hero__banner__content--cta-wrapper a.cta-section__main, .hero__banner__content--cta a")
    );
    if (!image && !title && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    ctaLinks.forEach((a) => {
      a.querySelectorAll("img, .cta-section__icon").forEach((n) => n.remove());
    });
    const cells = [];
    if (image) {
      const imageFrag = document.createDocumentFragment();
      imageFrag.appendChild(document.createComment(" field:image "));
      imageFrag.appendChild(image);
      cells.push([imageFrag]);
    }
    const textContent = [];
    if (title) textContent.push(title);
    ctaLinks.forEach((a) => textContent.push(a));
    if (textContent.length) {
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      textContent.forEach((node) => textFrag.appendChild(node));
      cells.push([textFrag]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-luxury", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-showcase.js
  function parse2(element, { document }) {
    const cells = [];
    const pushSlide = (image, contentNodes, bgLight, bgDark) => {
      const content = (contentNodes || []).filter(Boolean);
      if (!image && content.length === 0) return;
      let imageCell = "";
      if (image || bgLight || bgDark) {
        const imageFrag = document.createDocumentFragment();
        if (image) {
          imageFrag.appendChild(document.createComment(" field:media_image "));
          imageFrag.appendChild(image);
        }
        if (bgLight) {
          imageFrag.appendChild(document.createComment(" field:media_backgroundLight "));
          imageFrag.appendChild(bgLight);
        }
        if (bgDark) {
          imageFrag.appendChild(document.createComment(" field:media_backgroundDark "));
          imageFrag.appendChild(bgDark);
        }
        imageCell = imageFrag;
      }
      let contentCell = "";
      if (content.length) {
        const contentFrag = document.createDocumentFragment();
        contentFrag.appendChild(document.createComment(" field:content_text "));
        content.forEach((node) => contentFrag.appendChild(node));
        contentCell = contentFrag;
      }
      cells.push([imageCell, contentCell]);
    };
    const cleanLink = (a) => {
      a.querySelectorAll("img, .cta-section__icon").forEach((n) => n.remove());
      return a;
    };
    if (element.querySelector(".product-showcase__swiper, .car-models-carousel__content")) {
      const slideImages = Array.from(
        element.querySelectorAll(".product-showcase__swiper .swiper-slide")
      ).map((slide) => slide.querySelector(
        ".product-showcase__swiper--image-light img, .product-showcase__swiper--image img, picture img, img"
      ));
      const bgLightSrc = element.querySelector(".product-showcase__background--light img");
      const bgDarkSrc = element.querySelector(".product-showcase__background--dark img");
      const contentBlocks = Array.from(
        element.querySelectorAll(".car-models-carousel__content")
      ).filter((c) => c.querySelector("h1, h2, h3, h4, h5, h6"));
      const count = Math.max(slideImages.length, contentBlocks.length);
      for (let i = 0; i < count; i += 1) {
        const image = slideImages[i] || null;
        const bgLight = bgLightSrc ? bgLightSrc.cloneNode(true) : null;
        const bgDark = bgDarkSrc ? bgDarkSrc.cloneNode(true) : null;
        const contentBlock = contentBlocks[i];
        const contentNodes = [];
        if (contentBlock) {
          const heading = contentBlock.querySelector("h1, h2, h3, h4, h5, h6");
          const desc = contentBlock.querySelector("p, .car-models-carousel__content-description");
          if (heading) contentNodes.push(heading);
          if (desc) contentNodes.push(desc);
          const seen = /* @__PURE__ */ new Set();
          contentBlock.querySelectorAll(".car-models-carousel__content-cta a, .cta-download a").forEach((a) => {
            const href = a.getAttribute("href");
            if (href && !seen.has(href)) {
              seen.add(href);
              contentNodes.push(cleanLink(a));
            }
          });
        }
        pushSlide(image, contentNodes, bgLight, bgDark);
      }
      if (cells.length) {
        const block2 = WebImporter.Blocks.createBlock(document, { name: "carousel-showcase", cells });
        element.replaceWith(block2);
        return;
      }
    }
    if (element.querySelector(".mg-carousel, .mg-swiper")) {
      const seen = /* @__PURE__ */ new Set();
      element.querySelectorAll(".swiper-slide").forEach((slide) => {
        const image = slide.querySelector(
          "img.hero__banner__dm--img, .hero__banner__dm__img--container img"
        );
        if (!image) return;
        const src = image.getAttribute("src");
        if (src && seen.has(src)) return;
        if (src) seen.add(src);
        const linkAnchor = slide.querySelector(".hero__banner__dm__img--container a[href]");
        const contentNodes = [];
        if (linkAnchor) {
          const href = linkAnchor.getAttribute("href");
          const label = image.getAttribute("alt") || href;
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = label;
          contentNodes.push(a);
        }
        pushSlide(image, contentNodes);
      });
      if (cells.length) {
        const block2 = WebImporter.Blocks.createBlock(document, { name: "carousel-showcase", cells });
        element.replaceWith(block2);
        return;
      }
    }
    {
      const seen = /* @__PURE__ */ new Set();
      const slides = element.querySelector(".swiper-wrapper") ? element.querySelectorAll(".swiper-wrapper > .swiper-slide") : element.querySelectorAll(".swiper-slide");
      slides.forEach((slide) => {
        const image = slide.querySelector("picture img, img");
        if (!image) return;
        const src = image.getAttribute("src");
        if (src && seen.has(src)) return;
        if (src) seen.add(src);
        pushSlide(image, []);
      });
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-showcase", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-timeline.js
  function parse3(element, { document }) {
    const cards = Array.from(element.querySelectorAll(".timeline-card"));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const year = card.querySelector(".model-year");
      const overlay = card.querySelector(".overlay");
      const tooltip = card.querySelector(".timeline-card-tooltip");
      const img = card.querySelector(".timeline-card__picture img, picture img, img");
      let cardTitle = "";
      if (overlay) {
        const clone = overlay.cloneNode(true);
        clone.querySelectorAll(".timeline-card-tooltip, span").forEach((n) => n.remove());
        cardTitle = clone.textContent.replace(/\s+/g, " ").trim();
      }
      const description = tooltip ? tooltip.textContent.replace(/\s+/g, " ").trim() : "";
      let imageCell = "";
      if (img) {
        const imageFrag = document.createDocumentFragment();
        imageFrag.appendChild(document.createComment(" field:image "));
        imageFrag.appendChild(img);
        imageCell = imageFrag;
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      const yearValue = year ? year.textContent.trim() : "";
      if (yearValue || cardTitle) {
        const h = document.createElement("h4");
        h.textContent = `${yearValue}${yearValue && cardTitle ? " \u2014 " : ""}${cardTitle}`;
        textFrag.appendChild(h);
      }
      if (description) {
        const p = document.createElement("p");
        p.textContent = description;
        textFrag.appendChild(p);
      }
      cells.push([imageCell, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-timeline", cells });
    const heading = element.querySelector(".timeline-container__title, h1, h2, h3");
    if (heading && heading.textContent.trim()) {
      const introHeading = document.createElement("h2");
      introHeading.textContent = heading.textContent.trim();
      element.replaceWith(introHeading, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/transformers/mgselect-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cookieConsent",
        "section.cookie-consent",
        ".header__overlay"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment",
        "footer.experiencefragment",
        ".cmp-experiencefragment--header",
        ".cmp-experiencefragment--footer"
      ]);
      element.querySelectorAll("[data-cmp-data-layer-name], [data-cmp-data-layer], [data-cmp-data-layer-id]").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer-name");
        el.removeAttribute("data-cmp-data-layer");
        el.removeAttribute("data-cmp-data-layer-id");
      });
    }
  }

  // tools/importer/transformers/mgselect-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) {
        console.warn("Section selector not found, skipping:", section.selector);
        continue;
      }
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(metaBlock);
      }
      if (i > 0 && sectionEl.previousElementSibling) {
        const hr = doc.createElement("hr");
        sectionEl.before(hr);
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "MG Select homepage with hero banner, product showcase carousel, brand manifesto, dealer/showroom carousel, and heritage timeline tabs",
    urls: [
      "https://www.mgselect.co.in/"
    ],
    blocks: [
      {
        name: "hero-luxury",
        instances: ["div.banner.mg-select-scroller.light-header"]
      },
      {
        name: "carousel-showcase",
        instances: [
          "div.productShowcase.mg-select-scroller.dark-header",
          "div.brandManifesto.mg-select-scroller div.brand-manifesto__gallery",
          "div.carousel.panelcontainer.mg-select-scroller.dark-header"
        ]
      },
      {
        name: "tabs-timeline",
        instances: ["div.tabs.panelcontainer.mg-header-white.mg-select-scroller"]
      }
    ],
    sections: [
      {
        id: "hero",
        name: "Hero Banner",
        selector: "div.banner.mg-select-scroller.light-header",
        style: null,
        blocks: ["hero-luxury"],
        defaultContent: []
      },
      {
        id: "productShowcase",
        name: "Product Showcase",
        selector: "div.productShowcase.mg-select-scroller.dark-header",
        style: null,
        blocks: ["carousel-showcase"],
        defaultContent: []
      },
      {
        id: "brandManifesto",
        name: "Brand Manifesto",
        selector: "div.brandManifesto.mg-select-scroller",
        style: "light",
        blocks: ["carousel-showcase"],
        defaultContent: ["div.brand-manifesto__content"]
      },
      {
        id: "dealerCarousel",
        name: "Dealer Carousel",
        selector: "div.carousel.panelcontainer.mg-select-scroller.dark-header",
        style: null,
        blocks: ["carousel-showcase"],
        defaultContent: []
      },
      {
        id: "heritageTabs",
        name: "Heritage Timeline",
        selector: "div.tabs.panelcontainer.mg-header-white.mg-select-scroller",
        style: "light",
        blocks: ["tabs-timeline"],
        defaultContent: ["div.timeline-container__container > div.d-flex.flex-column"]
      }
    ]
  };
  var parsers = {
    "hero-luxury": parse,
    "carousel-showcase": parse2,
    "tabs-timeline": parse3
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      let rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "");
      if (rawPath === "") rawPath = "/index";
      const path = WebImporter.FileUtils.sanitizePath(rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
