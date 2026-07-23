/**
 * Hero Luxury: full-bleed photographic banner with a bottom-centered
 * heading and a single call-to-action. Purely visual — styling lives in
 * the accompanying CSS. This decorator only tags the CTA so it can be
 * styled distinctly from the plain-link fallback.
 * @param {Element} block The hero-luxury block element
 */
export default async function decorate(block) {
  const cta = block.querySelector(':scope > div:last-child a[href]');
  if (cta) cta.classList.add('hero-luxury-cta');
}
