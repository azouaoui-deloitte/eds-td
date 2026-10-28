import { buildArtDirectedPicture } from '../../scripts/scripts.js';

const BREAKPOINTS = {
  4: [1200, 1024, 768],
  3: [1024, 768],
  2: [768],
};

/**
 * Brand banner: art-directed image on one half, display heading, text and button on the other.
 * Rows: 1) images (widest first) 2) content
 * @param {Element} block
 */
export default function decorate(block) {
  const [imageRow, contentRow] = [...block.children];

  const media = document.createElement('div');
  media.className = 'banner-media';
  const imgs = [...imageRow.querySelectorAll('img')];
  if (imgs.length > 1) {
    media.append(buildArtDirectedPicture(imgs, BREAKPOINTS[imgs.length] || [768]));
  } else if (imgs.length) {
    media.append(imgs[0].closest('picture'));
  }

  const content = document.createElement('div');
  content.className = 'banner-content';
  const inner = document.createElement('div');
  inner.append(...contentRow.firstElementChild.childNodes);
  content.append(inner);

  block.replaceChildren(media, content);
}
