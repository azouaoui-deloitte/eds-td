import { buildArtDirectedPicture } from '../../scripts/scripts.js';

const BREAKPOINTS = {
  4: [1200, 1024, 768],
  3: [1024, 768],
  2: [768],
};

let count = 0;

/**
 * Extracts the authored images of a cell (widest first) and removes their now empty wrappers.
 * @param {Element} cell
 * @returns {HTMLImageElement[]}
 */
function takeImages(cell) {
  const imgs = [...cell.querySelectorAll('img')];
  imgs.forEach((img) => {
    const wrapper = img.closest('p');
    const picture = img.closest('picture') || img;
    picture.remove();
    if (wrapper && !wrapper.textContent.trim() && !wrapper.querySelector('img')) wrapper.remove();
  });
  return imgs;
}

/**
 * Triple banner (TD cmp-banner-triple): three promotional banners switched by tabs on desktop,
 * swiped as a carousel with dots below 1024px.
 * Cells of each row: 1) tab label 2) images (widest first: >=1200, >=1024, >=768, mobile)
 * 3) heading, text, button.
 * @param {Element} block
 */
export default function decorate(block) {
  count += 1;
  const id = `banner-triple-${count}`;
  const slides = document.createElement('div');
  slides.className = 'banner-triple-slides';
  const tablist = document.createElement('div');
  tablist.className = 'banner-triple-tabs';
  tablist.setAttribute('role', 'tablist');
  const dots = document.createElement('div');
  dots.className = 'banner-triple-dots';

  const items = [...block.children].map((row, i) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const contentCell = cells[cells.length - 1];
    const imageCell = cells.length > 2 ? cells[1] : contentCell;
    const imgs = takeImages(imageCell);

    const slide = document.createElement('div');
    slide.className = 'banner-triple-slide';
    slide.id = `${id}-panel-${i}`;
    slide.setAttribute('role', 'tabpanel');
    const media = document.createElement('div');
    media.className = 'banner-triple-media';
    if (imgs.length > 1) {
      media.append(buildArtDirectedPicture(imgs, BREAKPOINTS[imgs.length] || [768], i === 0));
    } else if (imgs.length === 1) {
      const picture = document.createElement('picture');
      picture.append(imgs[0]);
      media.append(picture);
    }
    const content = document.createElement('div');
    content.className = 'banner-triple-content';
    const inner = document.createElement('div');
    inner.append(...contentCell.childNodes);
    content.append(inner);
    slide.append(media, content);
    slides.append(slide);

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'banner-triple-tab';
    tab.id = `${id}-tab-${i}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', slide.id);
    slide.setAttribute('aria-labelledby', tab.id);
    const label = document.createElement('span');
    label.className = 'banner-triple-label';
    label.append(...(labelCell === contentCell ? [] : labelCell.childNodes));
    label.querySelectorAll('p').forEach((p) => p.replaceWith(...p.childNodes));
    tab.append(label);
    tablist.append(tab);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'banner-triple-dot';
    dot.setAttribute('aria-label', `Diapositive ${i + 1}`);
    dot.setAttribute('aria-controls', slide.id);
    dots.append(dot);
    return { slide, tab, dot };
  });

  let current = 0;
  const show = (index) => {
    current = index;
    items.forEach(({ slide, tab, dot }, i) => {
      const active = i === index;
      slide.classList.toggle('active', active);
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active);
      tab.tabIndex = active ? 0 : -1;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active);
    });
  };
  const isCarousel = () => getComputedStyle(slides).overflowX !== 'visible';

  items.forEach(({ slide, tab, dot }, i) => {
    tab.addEventListener('click', () => show(i));
    tab.addEventListener('keydown', (e) => {
      const last = items.length - 1;
      let next = null;
      if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
      if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
      if (next !== null) {
        e.preventDefault();
        show(next);
        items[next].tab.focus();
      }
    });
    dot.addEventListener('click', () => {
      show(i);
      slides.scrollTo({ left: slide.offsetLeft - slides.offsetLeft, behavior: 'smooth' });
    });
  });

  const observer = new IntersectionObserver((entries) => {
    if (!isCarousel()) return;
    entries.forEach((entry) => {
      if (entry.isIntersecting) show(items.findIndex(({ slide }) => slide === entry.target));
    });
  }, { root: slides, threshold: 0.6 });
  items.forEach(({ slide }) => observer.observe(slide));

  window.addEventListener('resize', () => {
    if (isCarousel()) slides.scrollLeft = items[current].slide.offsetLeft - slides.offsetLeft;
  }, { passive: true });

  block.replaceChildren(slides, tablist, dots);
  if (items.length) show(0);
}
