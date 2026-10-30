import { buildArtDirectedPicture, moveInstrumentation } from '../../scripts/scripts.js';

const BREAKPOINTS = {
  4: [1200, 1024, 768],
  3: [1024, 768],
  2: [768],
};

/**
 * Hero banner: art-directed background, green headline square and body copy.
 * Rows: 1) images (widest first) 2) headline 3) body copy and call to action
 * @param {Element} block
 */
export default function decorate(block) {
  const [imageRow, headlineRow, bodyRow] = [...block.children];

  const background = document.createElement('div');
  background.className = 'hero-background';
  const imgs = imageRow ? [...imageRow.querySelectorAll('img')] : [];
  if (imgs.length > 1) {
    const picture = buildArtDirectedPicture(imgs, BREAKPOINTS[imgs.length] || [768], true);
    moveInstrumentation(imgs[0], picture.querySelector('img'));
    background.append(picture);
  } else if (imgs.length === 1) {
    const picture = imgs[0].closest('picture');
    picture.querySelector('img').loading = 'eager';
    background.append(picture);
  }

  const square = document.createElement('div');
  square.className = 'hero-square';
  if (headlineRow) {
    const cell = headlineRow.firstElementChild;
    moveInstrumentation(cell, square);
    if (cell.querySelector('p')) {
      square.append(...cell.childNodes);
    } else {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      square.append(p);
    }
  }

  const body = document.createElement('div');
  body.className = 'hero-body';
  if (bodyRow) {
    moveInstrumentation(bodyRow.firstElementChild, body);
    body.append(...bodyRow.firstElementChild.childNodes);
  }

  block.replaceChildren(background, square, body);
}
