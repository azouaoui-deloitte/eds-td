import { createOptimizedPicture } from '../../scripts/aem.js';

const VISIBLE_ITEMS = 3;

function isLabelRow(row) {
  return row.children.length === 1
    && !row.querySelector('picture, a, h1, h2, h3, h4, h5, h6')
    && row.textContent.trim() !== '';
}

/**
 * Item list (TD "cmp-item-list"): image, linked title and description per row.
 * An optional last row holding only text (e.g. "Tout voir") reveals the items beyond the third.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const label = rows.length && isLabelRow(rows[rows.length - 1]) ? rows.pop().textContent.trim() : '';

  const ul = document.createElement('ul');
  rows.forEach((row) => {
    const li = document.createElement('li');
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      cell.className = pic && cell.textContent.trim() === '' ? 'item-list-image' : 'item-list-body';
      li.append(cell);
    });
    ul.append(li);
  });

  ul.querySelectorAll('.item-list-image img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    const optimizedImg = optimized.querySelector('img');
    if (img.getAttribute('width')) optimizedImg.width = img.getAttribute('width');
    if (img.getAttribute('height')) optimizedImg.height = img.getAttribute('height');
    img.closest('picture').replaceWith(optimized);
  });

  block.replaceChildren(ul);

  const hidden = [...ul.children].slice(VISIBLE_ITEMS);
  if (!label || !hidden.length) return;

  ul.id = ul.id || `item-list-${Math.random().toString(36).slice(2, 8)}`;
  hidden.forEach((li) => { li.hidden = true; });

  const more = document.createElement('div');
  more.className = 'item-list-more';
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', ul.id);
  button.textContent = label;
  button.addEventListener('click', () => {
    hidden.forEach((li) => { li.hidden = false; });
    button.setAttribute('aria-expanded', 'true');
    more.remove();
    const firstLink = hidden[0].querySelector('a');
    if (firstLink) firstLink.focus();
  });
  more.append(button);
  block.append(more);
}
