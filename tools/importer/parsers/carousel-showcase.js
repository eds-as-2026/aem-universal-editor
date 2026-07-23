/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-showcase.
 * Base block: carousel
 * Source URL: https://www.mgselect.co.in/
 * Generated: 2026-07-23
 *
 * Library convention (base: carousel) — container block:
 *   Row 1: block name.
 *   Each subsequent row = one slide with columns:
 *     - Image (mandatory) -> model media_image / media_imageAlt (alt collapses to <img alt>)
 *     - Text content (optional, richtext: heading/description/CTA) -> model content_text
 *
 * This variant covers THREE distinct source structures (union selectors in
 * page-templates.json). The parser detects which one it is and emits slide rows:
 *   A. Product showcase (div.productShowcase): swiper product images +
 *      .car-models-carousel__content (name, description, CTAs).
 *   B. Brand manifesto gallery (div.brand-manifesto__gallery): image-only slides.
 *   C. Dealer carousel (div.carousel.panelcontainer): linked hero images per city.
 *
 * Note: images are Dynamic Media / Scene7 URLs; the parser leaves each <img> in
 * its natural media_image slot and the DM/Scene7 transformer rewrites them later.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Helper: build a [imageCell, contentCell] slide row with field hints.
  const pushSlide = (image, contentNodes) => {
    const content = (contentNodes || []).filter(Boolean);
    if (!image && content.length === 0) return;

    let imageCell = '';
    if (image) {
      const imageFrag = document.createDocumentFragment();
      imageFrag.appendChild(document.createComment(' field:media_image '));
      imageFrag.appendChild(image);
      imageCell = imageFrag;
    }

    let contentCell = '';
    if (content.length) {
      const contentFrag = document.createDocumentFragment();
      contentFrag.appendChild(document.createComment(' field:content_text '));
      content.forEach((node) => contentFrag.appendChild(node));
      contentCell = contentFrag;
    }

    cells.push([imageCell, contentCell]);
  };

  // Strip decorative base64 svg icons out of a CTA/link before reuse.
  const cleanLink = (a) => {
    a.querySelectorAll('img, .cta-section__icon').forEach((n) => n.remove());
    return a;
  };

  // --- STRUCTURE A: Product showcase ---
  if (element.querySelector('.product-showcase__swiper, .car-models-carousel__content')) {
    // Foreground product images live in the swiper slides (light theme layer).
    const slideImages = Array.from(
      element.querySelectorAll('.product-showcase__swiper .swiper-slide'),
    ).map((slide) => slide.querySelector(
      '.product-showcase__swiper--image-light img, .product-showcase__swiper--image img, picture img, img',
    ));

    // Content blocks (one per model). Only keep those with a heading (skip decorative clones).
    const contentBlocks = Array.from(
      element.querySelectorAll('.car-models-carousel__content'),
    ).filter((c) => c.querySelector('h1, h2, h3, h4, h5, h6'));

    const count = Math.max(slideImages.length, contentBlocks.length);
    for (let i = 0; i < count; i += 1) {
      const image = slideImages[i] || null;
      const contentBlock = contentBlocks[i];
      const contentNodes = [];
      if (contentBlock) {
        const heading = contentBlock.querySelector('h1, h2, h3, h4, h5, h6');
        const desc = contentBlock.querySelector('p, .car-models-carousel__content-description');
        if (heading) contentNodes.push(heading);
        if (desc) contentNodes.push(desc);
        // CTAs: explore + brochure. Dedup by href (mobile/desktop are duplicates).
        const seen = new Set();
        contentBlock
          .querySelectorAll('.car-models-carousel__content-cta a, .cta-download a')
          .forEach((a) => {
            const href = a.getAttribute('href');
            if (href && !seen.has(href)) {
              seen.add(href);
              contentNodes.push(cleanLink(a));
            }
          });
      }
      pushSlide(image, contentNodes);
    }
    if (cells.length) {
      const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-showcase', cells });
      element.replaceWith(block);
      return;
    }
  }

  // --- STRUCTURE C: Dealer carousel (linked hero images per city) ---
  if (element.querySelector('.mg-carousel, .mg-swiper')) {
    const seen = new Set();
    // One row per swiper slide. Iterate the slide elements directly (not their
    // descendants) so each dealer produces exactly one row.
    element.querySelectorAll('.swiper-slide').forEach((slide) => {
      // Foreground dealer image (not the shared background layer).
      const image = slide.querySelector(
        'img.hero__banner__dm--img, .hero__banner__dm__img--container img',
      );
      if (!image) return;
      const src = image.getAttribute('src');
      if (src && seen.has(src)) return; // skip swiper clones
      if (src) seen.add(src);

      // Dealer link wraps the image.
      const linkAnchor = slide.querySelector('.hero__banner__dm__img--container a[href]');
      const contentNodes = [];
      if (linkAnchor) {
        const href = linkAnchor.getAttribute('href');
        const label = image.getAttribute('alt') || href;
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = label;
        contentNodes.push(a);
      }
      pushSlide(image, contentNodes);
    });
    if (cells.length) {
      const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-showcase', cells });
      element.replaceWith(block);
      return;
    }
  }

  // --- STRUCTURE B: Brand manifesto gallery (image-only slides) ---
  {
    const seen = new Set();
    const slides = element.querySelector('.swiper-wrapper')
      ? element.querySelectorAll('.swiper-wrapper > .swiper-slide')
      : element.querySelectorAll('.swiper-slide');
    slides.forEach((slide) => {
      const image = slide.querySelector('picture img, img');
      if (!image) return;
      const src = image.getAttribute('src');
      if (src && seen.has(src)) return; // skip duplicated loop slides
      if (src) seen.add(src);
      pushSlide(image, []);
    });
  }

  // --- EMPTY-BLOCK GUARD ---
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-showcase', cells });
  element.replaceWith(block);
}
