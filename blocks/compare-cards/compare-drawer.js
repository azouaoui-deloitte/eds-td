const MAX = 3;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/**
 * "Comparer" checkboxes on each card and TD sticky compare drawer (cmp-compare-sticky-drawer).
 * Settings row (no heading): plain paragraphs = drawer title, "clear" label;
 * links = compare page ("Comparer"), "add another product" page.
 * The selection stays on this page: TD's compare page reads its own storage and cannot receive it.
 * @param {Element} block compare-cards block
 * @param {Element} settings settings row
 */
export default function initDrawer(block, settings) {
  const texts = [...settings.querySelectorAll('p')]
    .filter((p) => !p.querySelector('a'))
    .map((p) => p.textContent.trim());
  const [title = 'Comparer les cartes', clearLabel = 'Tout effacer'] = texts;
  const [compareLink, addLink] = [...settings.querySelectorAll('a[href]')];
  const compareLabel = compareLink ? compareLink.textContent.trim() : 'Comparer';

  const cards = [...block.querySelectorAll(':scope > ul > li')].map((li, i) => {
    const link = li.querySelector('.compare-cards-title a');
    const img = li.querySelector('.compare-cards-image img');
    const label = el('label', 'compare-cards-check');
    const input = el('input');
    input.type = 'checkbox';
    const heading = li.querySelector('.compare-cards-title > *');
    if (heading) {
      heading.id = heading.id || `${block.id || 'compare-cards'}-title-${i}`;
      input.setAttribute('aria-describedby', heading.id);
    }
    label.append(input, el('span', 'compare-cards-check-box'), el('span', 'compare-cards-check-label', compareLabel));
    li.querySelector('.compare-cards-actions').append(label);
    return {
      input,
      badge: li.querySelector('.compare-cards-ribbon')?.textContent.trim(),
      href: link?.href,
      html: link ? link.innerHTML : heading?.innerHTML,
      img: img?.currentSrc || img?.src,
    };
  });

  const drawer = el('div', 'compare-drawer');
  drawer.setAttribute('role', 'region');
  drawer.setAttribute('aria-label', title);
  drawer.hidden = true;
  const inner = el('div', 'compare-drawer-inner');
  const header = el('div', 'compare-drawer-header');
  const toggle = el('button', 'compare-drawer-toggle', title);
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'true');
  const clear = el('button', 'compare-drawer-clear', clearLabel);
  clear.type = 'button';
  header.append(toggle, clear);
  const body = el('div', 'compare-drawer-body');
  body.id = `${block.id || 'compare-cards'}-drawer`;
  toggle.setAttribute('aria-controls', body.id);
  inner.append(header, body);
  drawer.append(inner);
  block.append(drawer);

  const selected = () => cards.filter((c) => c.input.checked);
  const setExpanded = (expanded) => {
    toggle.setAttribute('aria-expanded', expanded);
    drawer.classList.toggle('collapsed', !expanded);
  };

  const render = () => {
    const chosen = selected();
    drawer.hidden = !chosen.length;
    document.body.classList.toggle('compare-drawer-open', chosen.length > 0);
    cards.forEach((c) => { c.input.disabled = !c.input.checked && chosen.length >= MAX; });
    const cols = chosen.map((card) => {
      const col = el('div', 'compare-drawer-col');
      const offer = el('div', 'compare-drawer-offer');
      if (card.badge) offer.append(el('span', 'compare-cards-ribbon', card.badge));
      const h3 = el('h3');
      const a = el('a');
      a.href = card.href || '#';
      a.innerHTML = card.html || '';
      h3.append(a);
      const media = el('div', 'compare-drawer-media');
      if (card.img) {
        const img = el('img');
        img.src = card.img;
        img.alt = '';
        media.append(img);
      }
      const remove = el('button', 'compare-drawer-remove');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Retirer ${a.textContent.trim()}`);
      remove.addEventListener('click', () => {
        card.input.checked = false;
        render();
        card.input.focus();
      });
      media.append(remove);
      col.append(offer, h3, media);
      return col;
    });
    if (addLink) {
      for (let i = chosen.length; i < MAX; i += 1) {
        const col = el('div', 'compare-drawer-col compare-drawer-add');
        col.append(el('div', 'compare-drawer-offer'));
        const h3 = el('h3');
        const a = el('a', '', addLink.textContent.trim());
        a.href = addLink.href;
        h3.append(a);
        const plus = el('a', 'compare-drawer-plus');
        plus.href = addLink.href;
        plus.tabIndex = -1;
        plus.setAttribute('aria-hidden', 'true');
        col.append(h3, plus);
        cols.push(col);
      }
    }
    const action = el('div', 'compare-drawer-col compare-drawer-action');
    const go = el('a', 'button secondary', compareLabel);
    go.href = compareLink ? compareLink.href : '#';
    if (chosen.length < 2) {
      go.classList.add('disabled');
      go.setAttribute('aria-disabled', 'true');
      go.tabIndex = -1;
    }
    action.append(go);
    body.replaceChildren(...cols, action);
  };

  body.addEventListener('click', (e) => {
    const go = e.target.closest('.compare-drawer-action a.disabled');
    if (go) e.preventDefault();
  });
  toggle.addEventListener('click', () => setExpanded(toggle.getAttribute('aria-expanded') !== 'true'));
  clear.addEventListener('click', () => {
    cards.forEach((c) => { c.input.checked = false; });
    render();
  });
  cards.forEach((c) => c.input.addEventListener('change', () => {
    setExpanded(true);
    render();
  }));
  render();
}
