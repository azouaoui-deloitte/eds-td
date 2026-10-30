import { buildArtDirectedPicture, moveInstrumentation } from '../../scripts/scripts.js';

const BREAKPOINTS = {
  4: [1200, 1024, 768],
  3: [1024, 768],
  2: [768],
};

/**
 * TD promo banner (cmp-banner-container): art-directed background image,
 * title, text and one or two buttons in a column of the 12-column grid.
 * Cells: images (widest first) | content. Images and content may also be on two rows.
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const imgs = [...block.querySelectorAll('img')];

  const media = document.createElement('div');
  media.className = 'promo-banner-media';
  if (imgs.length > 1) {
    const picture = buildArtDirectedPicture(imgs, BREAKPOINTS[imgs.length] || [768]);
    moveInstrumentation(imgs[0], picture.querySelector('img'));
    media.append(picture);
  } else if (imgs.length) {
    media.append(imgs[0].closest('picture') || imgs[0]);
  }

  const content = document.createElement('div');
  content.className = 'promo-banner-content';
  const inner = document.createElement('div');
  inner.className = 'promo-banner-text';
  cells.forEach((cell) => {
    cell.querySelectorAll('picture, img').forEach((el) => {
      const p = el.closest('p');
      el.remove();
      if (p && !p.textContent.trim() && !p.children.length) p.remove();
    });
    inner.append(...cell.childNodes);
  });
  const buttons = [...inner.querySelectorAll(':scope > p.button-wrapper')];
  if (buttons.length) {
    const actions = document.createElement('div');
    actions.className = 'promo-banner-actions';
    buttons[0].before(actions);
    actions.append(...buttons);
  }
  content.append(inner);

  block.replaceChildren(media, content);
}
