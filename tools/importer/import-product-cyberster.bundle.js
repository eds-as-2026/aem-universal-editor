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

  // tools/importer/import-product-cyberster.js
  var import_product_cyberster_exports = {};
  __export(import_product_cyberster_exports, {
    default: () => import_product_cyberster_default
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

  // tools/importer/parsers/cards-spec.js
  function parse2(element, { document }) {
    const cells = [];
    const pushCard = (image, textNodes) => {
      const text = (textNodes || []).filter(Boolean);
      if (!image && text.length === 0) return;
      let imageCell = "";
      if (image) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:image "));
        frag.appendChild(image);
        imageCell = frag;
      }
      let textCell = "";
      if (text.length) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:text "));
        text.forEach((n) => frag.appendChild(n));
        textCell = frag;
      }
      cells.push([imageCell, textCell]);
    };
    const heading = element.querySelector(".top-features__title, h1, h2, h3");
    const description = element.querySelector(".top-features__subtitle, .top-features__text p");
    const introNodes = [];
    if (heading) introNodes.push(heading);
    if (description) introNodes.push(description);
    if (introNodes.length) pushCard(null, introNodes);
    const statList = element.querySelector("ul.top-features__main");
    const seenStats = /* @__PURE__ */ new Set();
    if (statList) {
      statList.querySelectorAll(":scope > li.top-features__item").forEach((li) => {
        const paras = Array.from(li.querySelectorAll("p"));
        const value = paras[0] ? paras[0].textContent.replace(/\s+/g, " ").trim() : "";
        const label = paras[1] ? paras[1].textContent.replace(/\s+/g, " ").trim() : "";
        if (!value) return;
        const key = `${value}|${label}`;
        if (seenStats.has(key)) return;
        seenStats.add(key);
        const statFrag = document.createElement("div");
        const valueP = document.createElement("p");
        valueP.textContent = value;
        statFrag.appendChild(valueP);
        if (label) {
          const labelP = document.createElement("p");
          labelP.textContent = label;
          statFrag.appendChild(labelP);
        }
        pushCard(null, [...statFrag.childNodes]);
      });
    }
    const disclaimer = element.querySelector(".top-features__disclaimer p, .top-features__disclaimer");
    if (disclaimer) pushCard(null, [disclaimer]);
    const bgImage = element.querySelector(".top-features__bg img, .top-features__bg--image");
    if (bgImage) pushCard(bgImage, null);
    const carImage = element.querySelector(".top-features__car img, .top-features__car--image");
    if (carImage) pushCard(carImage, null);
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-spec", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-hotspot.js
  function parse3(element, { document }) {
    const cells = [];
    const pushCard = (image, textNodes) => {
      const text = (textNodes || []).filter(Boolean);
      if (!image && text.length === 0) return;
      let imageCell = "";
      if (image) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:image "));
        frag.appendChild(image);
        imageCell = frag;
      }
      let textCell = "";
      if (text.length) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:text "));
        text.forEach((n) => frag.appendChild(n));
        textCell = frag;
      }
      cells.push([imageCell, textCell]);
    };
    const textPara = (node, tag) => {
      if (!node) return null;
      const value = node.textContent.replace(/\s+/g, " ").trim();
      if (!value) return null;
      const el = document.createElement(tag || "p");
      el.textContent = value;
      return el;
    };
    const heading = element.querySelector(".hot__spot__content--heading");
    const subheading = element.querySelector(".hot__spot__content--desc");
    const posterImg = element.querySelector(".hot__spot__main--img, .hot__spot__main__img--container img");
    const introNodes = [];
    const headingEl = textPara(heading, "h2");
    const subEl = textPara(subheading, "p");
    if (headingEl) introNodes.push(headingEl);
    if (subEl) introNodes.push(subEl);
    if (introNodes.length || posterImg) pushCard(posterImg || null, introNodes);
    const seen = /* @__PURE__ */ new Set();
    element.querySelectorAll(".hot__spot__card--container").forEach((card) => {
      const title = card.querySelector(".hot__spot__card--title");
      const sub = card.querySelector(".hot__spot__card--subheading");
      const desc = card.querySelector(".hot__spot__card--desc");
      const titleText = title ? title.textContent.replace(/\s+/g, " ").trim() : "";
      if (!titleText) return;
      if (seen.has(titleText)) return;
      seen.add(titleText);
      const nodes = [];
      const titleEl = textPara(title, "h3");
      const subEl2 = textPara(sub, "p");
      const descEl = textPara(desc, "p");
      if (titleEl) nodes.push(titleEl);
      if (subEl2) nodes.push(subEl2);
      if (descEl) nodes.push(descEl);
      if (nodes.length) pushCard(null, nodes);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-hotspot", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-reveal.js
  function parse4(element, { document }) {
    const titleSrc = element.querySelector(".image__reveal--title, .image__reveal__content--container");
    let titleEl = null;
    if (titleSrc) {
      const value = titleSrc.textContent.replace(/\s+/g, " ").trim();
      if (value) {
        titleEl = document.createElement("p");
        titleEl.textContent = value;
      }
    }
    const overlayImg = element.querySelector(".image__reveal--overlay, .image__reveal--image.z-2 img");
    let baseImg = null;
    const overlaySrc = overlayImg ? overlayImg.getAttribute("src") : null;
    const allImgs = Array.from(element.querySelectorAll(".image__reveal--img, .image__reveal--image img, .image__reveal__glitch--img img"));
    for (const img of allImgs) {
      if (img === overlayImg) continue;
      const src = img.getAttribute("src");
      if (src && src === overlaySrc) continue;
      baseImg = img;
      break;
    }
    const col1 = [];
    if (titleEl) col1.push(titleEl);
    if (baseImg) col1.push(baseImg);
    const col2 = [];
    if (overlayImg) col2.push(overlayImg);
    if (col1.length === 0 && col2.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[col1, col2]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-reveal", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-drivemode.js
  function parse5(element, { document }) {
    const cells = [];
    const modeButtons = Array.from(
      element.querySelectorAll(".driving-mode__content--cta .cta-section__label, .driving-mode__content--cta button")
    );
    const primaryLabel = modeButtons.length ? modeButtons[0].textContent.replace(/\s+/g, " ").trim() : "";
    const headingSrc = element.querySelector(".driving-mode__content--title");
    const descSrc = element.querySelector(".driving-mode__content--description");
    const bgImage = element.querySelector(".driving-mode__bg--image, .driving-mode__bg picture img");
    const heading = headingSrc ? headingSrc.textContent.replace(/\s+/g, " ").trim() : "";
    const description = descSrc ? descSrc.textContent.replace(/\s+/g, " ").trim() : "";
    if (!primaryLabel && !heading && !description && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const titleFrag = document.createDocumentFragment();
    titleFrag.appendChild(document.createComment(" field:title "));
    const titleP = document.createElement("p");
    titleP.textContent = primaryLabel || heading || "Mode";
    titleFrag.appendChild(titleP);
    const contentFrag = document.createDocumentFragment();
    if (heading) {
      contentFrag.appendChild(document.createComment(" field:content_heading "));
      const h = document.createElement("h3");
      h.textContent = heading;
      contentFrag.appendChild(h);
    }
    if (bgImage) {
      contentFrag.appendChild(document.createComment(" field:content_image "));
      contentFrag.appendChild(bgImage);
    }
    if (description) {
      contentFrag.appendChild(document.createComment(" field:content_richtext "));
      const p = document.createElement("p");
      p.textContent = description;
      contentFrag.appendChild(p);
    }
    cells.push([titleFrag, contentFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-drivemode", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-safety.js
  function parse6(element, { document }) {
    const cells = [];
    const pushCard = (image, textNodes) => {
      const text = (textNodes || []).filter(Boolean);
      if (!image && text.length === 0) return;
      let imageCell = "";
      if (image) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:image "));
        frag.appendChild(image);
        imageCell = frag;
      }
      let textCell = "";
      if (text.length) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:text "));
        text.forEach((n) => frag.appendChild(n));
        textCell = frag;
      }
      cells.push([imageCell, textCell]);
    };
    const textEl = (node, tag) => {
      if (!node) return null;
      const value = node.textContent.replace(/\s+/g, " ").trim();
      if (!value) return null;
      const el = document.createElement(tag || "p");
      el.textContent = value;
      return el;
    };
    const heading = element.querySelector(".feature-cards__details--title");
    const description = element.querySelector(".feature-cards__details--description");
    const introNodes = [textEl(heading, "h2"), textEl(description, "p")].filter(Boolean);
    if (introNodes.length) pushCard(null, introNodes);
    const seen = /* @__PURE__ */ new Set();
    element.querySelectorAll(".mg__card--container").forEach((card) => {
      const img = card.querySelector(".mg__card__img--container img, .mg__card--img, picture img");
      const title = card.querySelector(".mg__card--title");
      const desc = card.querySelector(".mg__card--desc");
      const src = img ? img.getAttribute("src") : "";
      const titleText = title ? title.textContent.replace(/\s+/g, " ").trim() : "";
      const key = `${src}|${titleText}`;
      if (seen.has(key)) return;
      seen.add(key);
      const nodes = [textEl(title, "h3"), textEl(desc, "p")].filter(Boolean);
      if (img || nodes.length) pushCard(img || null, nodes);
    });
    const ribbon = element.querySelector(".sticky-ribbon");
    if (ribbon) {
      const nodes = [];
      const rTitle = textEl(ribbon.querySelector(".sticky-ribbon__title"), "h3");
      const rSub = textEl(ribbon.querySelector(".sticky-ribbon__subtitle"), "p");
      if (rTitle) nodes.push(rTitle);
      if (rSub) nodes.push(rSub);
      const seenHref = /* @__PURE__ */ new Set();
      ribbon.querySelectorAll(".sticky-ribbon__cta a[href]").forEach((a) => {
        const href = a.getAttribute("href");
        if (!href || seenHref.has(href)) return;
        seenHref.add(href);
        const label = a.querySelector(".cta-section__label");
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = (label ? label.textContent : a.textContent).replace(/\s+/g, " ").trim() || href;
        nodes.push(link);
      });
      if (nodes.length) pushCard(null, nodes);
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-safety", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-color.js
  function parse7(element, { document }) {
    const cells = [];
    const pushCard = (image, textNodes) => {
      const text = (textNodes || []).filter(Boolean);
      if (!image && text.length === 0) return;
      let imageCell = "";
      if (image) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:image "));
        frag.appendChild(image);
        imageCell = frag;
      }
      let textCell = "";
      if (text.length) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:text "));
        text.forEach((n) => frag.appendChild(n));
        textCell = frag;
      }
      cells.push([imageCell, textCell]);
    };
    const seen = /* @__PURE__ */ new Set();
    element.querySelectorAll(".color-variant__models--model").forEach((model) => {
      const img = model.querySelector(".color-variant--images img, picture img, img");
      if (!img) return;
      const src = img.getAttribute("src");
      if (src && seen.has(src)) return;
      if (src) seen.add(src);
      const name = (img.getAttribute("alt") || img.getAttribute("title") || "").trim();
      const nodes = [];
      if (name) {
        const label = document.createElement("h3");
        label.textContent = name;
        nodes.push(label);
      }
      pushCard(img, nodes);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-color", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-showcase.js
  function parse8(element, { document }) {
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
    if (element.querySelector(".art-gallery__left--item, .art-gallery__right--item")) {
      const seen = /* @__PURE__ */ new Set();
      element.querySelectorAll(".art-gallery__left--item img, .art-gallery__right--item img").forEach((image) => {
        const src = image.getAttribute("src");
        if (src && seen.has(src)) return;
        if (src) seen.add(src);
        pushSlide(image, []);
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

  // tools/importer/parsers/cards-download.js
  function parse9(element, { document }) {
    const cells = [];
    const pushCard = (image, textNodes) => {
      const text = (textNodes || []).filter(Boolean);
      if (!image && text.length === 0) return;
      let imageCell = "";
      if (image) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:image "));
        frag.appendChild(image);
        imageCell = frag;
      }
      let textCell = "";
      if (text.length) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:text "));
        text.forEach((n) => frag.appendChild(n));
        textCell = frag;
      }
      cells.push([imageCell, textCell]);
    };
    const seen = /* @__PURE__ */ new Set();
    element.querySelectorAll(".quick-action__link a[href], a.quick-action__main[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || seen.has(href)) return;
      seen.add(href);
      const icon = a.querySelector(".quick-action__image, picture img");
      const labelSrc = a.querySelector(".quick-action__main-label");
      const label = (labelSrc ? labelSrc.textContent : a.getAttribute("title") || "").replace(/\s+/g, " ").trim();
      const link = document.createElement("a");
      link.setAttribute("href", href);
      link.textContent = label || href;
      pushCard(icon || null, [link]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-download", cells });
    element.replaceWith(block);
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

  // tools/importer/import-product-cyberster.js
  var PAGE_TEMPLATE = {
    name: "product-cyberster",
    description: "MG Cyberster product detail page",
    urls: [
      "https://www.mgselect.co.in/cyberster"
    ],
    blocks: [
      {
        name: "hero-luxury",
        instances: [
          "div.product-banner.light-header.mg-select-scroller",
          "div.banner.mg-select-scroller.light-header:nth-of-type(2)",
          "div.banner.mg-select-scroller.light-header:nth-of-type(8)",
          "div.mg-container.responsivegrid.mg-select-scroller.hide-header div.textImage"
        ]
      },
      { name: "cards-spec", instances: ["div.topFeatures.mg-select-scroller.light-header"] },
      {
        name: "cards-hotspot",
        instances: [
          "div.interactiveVideoHotspots.mg-select-scroller.light-header:nth-of-type(4)",
          "div.interactiveVideoHotspots.mg-select-scroller.light-header:nth-of-type(7)"
        ]
      },
      { name: "columns-reveal", instances: ["div.imageReveal.light-header.mg-select-scroller"] },
      { name: "tabs-drivemode", instances: ["div.drivingMode.light-header.mg-select-scroller"] },
      { name: "cards-safety", instances: ["div.featureCards.mg-header-white.mg-select-scroller"] },
      { name: "cards-color", instances: ["div.colorVariant.mg-select-scroller.light-header"] },
      { name: "carousel-showcase", instances: ["div.artGallery.mg-select-scroller.dark-header"] },
      { name: "cards-download", instances: ["div.mg-container.responsivegrid.mg-select-scroller.hide-header div.genericContainer"] }
    ],
    sections: [
      {
        id: "driving-mode",
        name: "Driving Mode",
        selector: "div.drivingMode.light-header.mg-select-scroller",
        style: "dark",
        blocks: ["tabs-drivemode"],
        defaultContent: []
      },
      {
        id: "art-gallery",
        name: "Art Gallery",
        selector: "div.artGallery.mg-select-scroller.dark-header",
        style: "dark",
        blocks: ["carousel-showcase"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "hero-luxury": parse,
    "cards-spec": parse2,
    "cards-hotspot": parse3,
    "columns-reveal": parse4,
    "tabs-drivemode": parse5,
    "cards-safety": parse6,
    "cards-color": parse7,
    "carousel-showcase": parse8,
    "cards-download": parse9
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  var import_product_cyberster_default = {
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
  return __toCommonJS(import_product_cyberster_exports);
})();
