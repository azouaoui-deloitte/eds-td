import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Simplified product comparison (TD cmp-simplified-compare-product).
 * One row per product; cells (any order, defensive): image | title (heading with link),
 * short description, feature list, call-to-action button.
 * Rows of all cards are aligned (CSS subgrid), like TD's computed min-heights.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const parts = {
      title: document.createElement('div'),
      image: document.createElement('div'),
      text: document.createElement('div'),
      action: document.createElement('div'),
    };
    Object.entries(parts).forEach(([name, el]) => { el.className = `simplified-compare-${name}`; });

    const nodes = [...row.children].flatMap((cell) => [...cell.children]);
    nodes.forEach((node) => {
      if (/^H[1-6]$/.test(node.tagName)) parts.title.append(node);
      else if (node.querySelector('picture, img') && !node.textContent.trim()) parts.image.append(node);
      else if (node.classList.contains('button-wrapper') || node.querySelector('a.button')) parts.action.append(node);
      else parts.text.append(node);
    });

    parts.image.querySelectorAll('img').forEach((img) => {
      const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
      img.closest('picture').replaceWith(optimized);
    });
    const hr = document.createElement('hr');
    parts.action.prepend(hr);
    li.append(parts.title, parts.image, parts.text, parts.action);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
