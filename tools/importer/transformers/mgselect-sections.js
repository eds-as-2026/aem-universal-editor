/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: MG Select (mgselect.co.in) section breaks + section metadata.
 *
 * Runs in afterTransform only. Reads the template's section definitions from
 * payload.template.sections and, for each section (processed in reverse so
 * inserted nodes don't shift later selectors):
 *   - inserts an <hr> before the section element for every non-first section
 *     that has content before it (yields sections.length - 1 breaks);
 *   - appends a Section Metadata block after the section element when the
 *     section has a `style` property set.
 *
 * Section selectors come from tools/importer/page-templates.json and were
 * verified against migration-work/cleaned.html:
 *   hero            div.banner.mg-select-scroller.light-header          (line 885)
 *   productShowcase div.productShowcase.mg-select-scroller.dark-header  (line 926)
 *   brandManifesto  div.brandManifesto.mg-select-scroller               (line 1134) style=light
 *   dealerCarousel  div.carousel.panelcontainer.mg-select-scroller...   (line 1292)
 *   heritageTabs    div.tabs.panelcontainer.mg-header-white...          (verified) style=light
 *
 * Reference: https://www.aem.live/developer/block-collection/section-metadata
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument;

  // Process in reverse so inserting <hr>/metadata for a later section does
  // not shift the position of earlier section elements.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) continue;

    const sectionEl = element.querySelector(section.selector);
    if (!sectionEl) {
      // eslint-disable-next-line no-console
      console.warn('Section selector not found, skipping:', section.selector);
      continue;
    }

    // Section Metadata block for sections that declare a style.
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(metaBlock);
    }

    // Section break before every non-first section that has content before it.
    if (i > 0 && sectionEl.previousElementSibling) {
      const hr = doc.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
