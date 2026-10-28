import { createOptimizedPicture } from '../../scripts/aem.js';

const MOBILE_CAROUSEL_VARIANTS = ['grey', 'illustration', 'tiles', 'features'];

function classifyCell(cell) {
  if (cell.querySelector('picture') && cell.textContent.trim() === '') return 'cards-card-image';
  if (cell.querySelector('span.icon') && cell.textContent.trim() === '' && !cell.querySelector('a')) return 'cards-card-icon';
  return 'cards-card-body';
}

function linkIcon(li) {
  const icon = li.querySelector('.cards-card-icon');
  const link = li.querySelector('.cards-card-body a[href]');
  if (!icon || !link) return;
  const a = document.createElement('a');
  a.href = link.href;
  a.tabIndex = -1;
  a.setAttribute('aria-hidden', 'true');
  a.append(...icon.childNodes);
  icon.append(a);
}

function buildDots(block, ul) {
  const items = [...ul.children];
  const nav = document.createElement('div');
  nav.className = 'cards-dots';
  nav.setAttribute('role', 'tablist');
  const dots = items.map((item, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Diapositive ${i + 1} de ${items.length}`);
    dot.addEventListener('click', () => {
      ul.scrollTo({ left: item.offsetLeft - ul.offsetLeft, behavior: 'smooth' });
    });
    nav.append(dot);
    return dot;
  });
  const setActive = (index) => dots.forEach((d, i) => {
    d.classList.toggle('active', i === index);
    d.setAttribute('aria-selected', i === index);
  });
  setActive(0);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(items.indexOf(entry.target));
    });
  }, { root: ul, threshold: 0.6 });
  items.forEach((item) => observer.observe(item));
  block.prepend(nav);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((cell) => { cell.className = classifyCell(cell); });
    if (block.classList.contains('icons')) linkIcon(li);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    const optimizedImg = optimized.querySelector('img');
    if (img.getAttribute('width')) optimizedImg.width = img.getAttribute('width');
    if (img.getAttribute('height')) optimizedImg.height = img.getAttribute('height');
    img.closest('picture').replaceWith(optimized);
  });
  block.replaceChildren(ul);
  if (MOBILE_CAROUSEL_VARIANTS.some((v) => block.classList.contains(v))
    && !block.classList.contains('stacked') && ul.children.length > 1) {
    block.classList.add('mobile-carousel');
    buildDots(block, ul);
  }
}
