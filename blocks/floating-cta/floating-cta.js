/**
 * Floating call-to-action bar (TD "floating container").
 * Fixed under the header; shown once its authored position has scrolled under the header.
 * Content: one row, first cell = text (hidden on mobile), second cell = button link.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];
  const [textCell, ctaCell] = cells.length > 1 ? cells : [null, cells[0]];

  const bar = document.createElement('div');
  bar.className = 'floating-cta-bar';
  bar.setAttribute('aria-hidden', 'true');
  const inner = document.createElement('div');
  inner.className = 'floating-cta-inner';
  if (textCell) {
    textCell.className = 'floating-cta-text';
    inner.append(textCell);
  }
  if (ctaCell) {
    ctaCell.className = 'floating-cta-action';
    ctaCell.querySelectorAll('a').forEach((a) => {
      a.className = 'button accent';
      a.tabIndex = -1;
      const p = a.closest('p');
      if (p) p.className = 'button-wrapper';
    });
    inner.append(ctaCell);
  }
  bar.append(inner);
  block.replaceChildren(bar);

  const wrapper = block.closest('.floating-cta-wrapper') || block;
  const update = () => {
    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 0;
    const show = wrapper.getBoundingClientRect().top < navHeight;
    bar.classList.toggle('visible', show);
    bar.setAttribute('aria-hidden', show ? 'false' : 'true');
    bar.querySelectorAll('a').forEach((a) => { a.tabIndex = show ? 0 : -1; });
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  new IntersectionObserver(update).observe(wrapper);
}
