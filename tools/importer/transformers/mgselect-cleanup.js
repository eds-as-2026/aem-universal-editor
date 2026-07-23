/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: MG Select (mgselect.co.in) site-wide cleanup.
 *
 * Removes non-authorable site chrome that EDS supplies via experience
 * fragments, plus the cookie-consent widget. All selectors below were
 * verified against migration-work/cleaned.html for the homepage capture.
 *
 * Verified in captured DOM:
 *   - <header class="experiencefragment ..."> ...          (line 8)
 *       nested <div class="cmp-experiencefragment--header"> (line 9)
 *       plus a full-viewport <div class="header__overlay ..."> (line 834)
 *   - <footer class="experiencefragment ..."> ...          (line 4319)
 *       nested <div class="cmp-experiencefragment--footer"> (line 4320)
 *       cookie consent <div class="cookieConsent ...">      (line 4322)
 *       and <section class="cookie-consent">                (line 4323)
 *
 * In EDS the header and footer are authored as separate experience
 * fragments, so an author creating this page would never type or
 * configure them — they must not appear in the imported page content.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie-consent widget and header overlay are position-fixed layers
    // that can interfere with block matching; remove before parsing.
    // Selectors verified in cleaned.html (cookieConsent line 4322,
    // cookie-consent line 4323, header__overlay line 834).
    WebImporter.DOMUtils.remove(element, [
      '.cookieConsent',
      'section.cookie-consent',
      '.header__overlay',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome delivered by EDS experience fragments.
    // Verified in cleaned.html: <header> line 8, <footer> line 4319.
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment',
      'footer.experiencefragment',
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--footer',
    ]);

    // Strip Adobe data-layer / analytics tracking attributes left on
    // elements (data-cmp-data-layer-name on <body>, line 1). These are
    // AEM-authoring instrumentation, not authorable content.
    element.querySelectorAll('[data-cmp-data-layer-name], [data-cmp-data-layer], [data-cmp-data-layer-id]').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer-name');
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-data-layer-id');
    });
  }
}
