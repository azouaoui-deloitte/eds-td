/**
 * Breadcrumb: one cell with links to the parent pages separated by "/",
 * followed by the current page title as plain text.
 * Mobile shows only a back link to the closest parent.
 * @param {Element} block
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const items = [];
  cell.querySelectorAll('a[href]').forEach((a) => items.push({ href: a.href, text: a.textContent.trim() }));
  const last = cell.textContent.split('/').pop().trim();
  const title = items.some((i) => i.text === last) ? '' : last;

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Fil d’Ariane');
  const ol = document.createElement('ol');
  items.forEach(({ href, text }, i) => {
    const li = document.createElement('li');
    if (i === items.length - 1) li.className = 'breadcrumb-parent';
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    li.append(a);
    ol.append(li);
  });
  if (title) {
    const li = document.createElement('li');
    li.className = 'breadcrumb-current';
    li.setAttribute('aria-current', 'page');
    li.textContent = title;
    ol.append(li);
  }
  nav.append(ol);
  block.replaceChildren(nav);
}
