function arrow(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `circle-links-arrow circle-links-${direction}`;
  button.setAttribute('aria-label', label);
  const icon = document.createElement('span');
  icon.className = 'icon';
  icon.style.setProperty('--icon', `url(${window.hlx.codeBasePath}/icons/right-caret.svg)`);
  button.append(icon);
  return button;
}

function setupScroller(block, ul) {
  const prev = arrow('prev', 'Précédent');
  const next = arrow('next', 'Suivant');
  const update = () => {
    const max = ul.scrollWidth - ul.clientWidth;
    block.classList.toggle('scrollable', max > 1);
    prev.hidden = ul.scrollLeft <= 1;
    next.hidden = ul.scrollLeft >= max - 1;
  };
  const step = (dir) => {
    const item = ul.querySelector('li');
    ul.scrollBy({ left: dir * (item ? item.offsetWidth : ul.clientWidth), behavior: 'smooth' });
  };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  ul.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(ul);
  block.append(prev, next);
  update();
}

/**
 * TD circle icon links (cmp-circle-slider).
 * Rows: icon cell (`:icon-name:`) | link cell (link text = label).
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const icon = row.querySelector('span.icon');
    const link = row.querySelector('a[href]');
    if (!icon && !link) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'circle-links-item';
    if (link) {
      a.href = link.href;
      if (link.title && link.title !== link.textContent) a.title = link.title;
    }
    const circle = document.createElement('span');
    circle.className = 'circle-links-icon';
    if (icon) circle.append(icon);
    const label = document.createElement('span');
    label.className = 'circle-links-label';
    if (link) label.append(...link.childNodes);
    a.append(circle, label);
    li.append(a);
    ul.append(li);
  });
  block.replaceChildren(ul);
  if (ul.children.length > 5) setupScroller(block, ul);
}
