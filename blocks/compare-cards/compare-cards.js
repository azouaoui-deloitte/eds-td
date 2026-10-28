import { createOptimizedPicture } from '../../scripts/aem.js';

const PARTS = ['badge', 'title', 'image', 'features', 'actions'];

function part(name) {
  const div = document.createElement('div');
  div.className = `compare-cards-${name}`;
  return div;
}

/**
 * TD product comparison cards (cmp-compare-product).
 * One row per card, one cell: [badge paragraph] heading, image, features list,
 * "details" link and call-to-action button(s).
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const parts = Object.fromEntries(PARTS.map((name) => [name, part(name)]));
    const elements = [...row.querySelectorAll(':scope > div > *')];
    const headingIndex = elements.findIndex((el) => /^H[1-6]$/.test(el.tagName));

    elements.forEach((el, i) => {
      if (headingIndex > -1 && i < headingIndex) {
        parts.badge.append(el);
      } else if (i === headingIndex) {
        parts.title.append(el);
      } else if (el.querySelector('picture') && !el.textContent.trim()) {
        parts.image.append(el);
      } else if (el.classList.contains('button-wrapper') || el.querySelector('a.link-action')) {
        parts.actions.append(el);
      } else {
        parts.features.append(el);
      }
    });

    parts.badge.querySelectorAll('p').forEach((p) => p.classList.add('compare-cards-ribbon'));
    parts.image.querySelectorAll('picture > img').forEach((img) => {
      const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
      img.closest('picture').replaceWith(optimized);
    });
    li.append(...PARTS.map((name) => parts[name]));
    ul.append(li);
  });
  block.replaceChildren(ul);

  // TD sizes the tablet feature lists with the single-column content width (345px)
  const tablet = window.matchMedia('(width >= 768px) and (width < 1024px)');
  const features = [...ul.querySelectorAll(':scope > li > .compare-cards-features')];
  const size = () => {
    features.forEach((f) => { f.style.minHeight = ''; });
    if (!tablet.matches) return;
    const heights = features.map((f) => {
      f.style.width = '345px';
      const height = f.offsetHeight;
      f.style.width = '';
      return height;
    });
    for (let i = 0; i < features.length; i += 2) {
      const max = Math.max(...heights.slice(i, i + 2));
      features.slice(i, i + 2).forEach((f) => { f.style.minHeight = `${max}px`; });
    }
  };
  let frame;
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(size);
  });
  observer.observe(block);
  features.forEach((f) => [...f.children].forEach((child) => observer.observe(child)));
}
