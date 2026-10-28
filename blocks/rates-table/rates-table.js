import { loadFragment } from '../fragment/fragment.js';

/**
 * Closes the open tooltip popover, if any.
 */
function closeTooltip() {
  const open = document.querySelector('.rates-table-popover');
  if (!open) return;
  const { opener } = open;
  open.remove();
  if (opener) {
    opener.setAttribute('aria-expanded', 'false');
    opener.focus();
  }
}

/**
 * Opens a tooltip popover below its link with the content of an `/modals/info-bulles/` document.
 * @param {HTMLAnchorElement} link
 */
async function openTooltip(link) {
  closeTooltip();
  const fragment = await loadFragment(new URL(link.href).pathname);
  if (!fragment) return;

  const popover = document.createElement('div');
  popover.className = 'rates-table-popover';
  popover.setAttribute('role', 'tooltip');
  popover.id = `rates-table-popover-${Math.random().toString(36).slice(2, 8)}`;
  popover.tabIndex = -1;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'rates-table-popover-close';
  close.setAttribute('aria-label', 'Fermer');
  close.innerHTML = `<span class="icon icon-close" style="--icon: url(${window.hlx.codeBasePath}/icons/close.svg)"></span>`;
  close.addEventListener('click', closeTooltip);
  const body = document.createElement('div');
  body.className = 'rates-table-popover-body';
  body.append(...fragment.querySelectorAll('.default-content-wrapper > *'));
  popover.append(close, body);
  popover.opener = link;
  document.body.append(popover);

  const r = link.getBoundingClientRect();
  const width = popover.offsetWidth;
  const left = Math.min(
    Math.max(15, r.left + r.width / 2 - width / 2),
    document.documentElement.clientWidth - width - 15,
  );
  popover.style.left = `${left + window.scrollX}px`;
  popover.style.top = `${r.bottom + window.scrollY + 12}px`;
  link.setAttribute('aria-expanded', 'true');
  link.setAttribute('aria-describedby', popover.id);
  popover.focus();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeTooltip();
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.rates-table-popover, .rates-table-tooltip')) closeTooltip();
});

/**
 * Rates table (TD "table 11-3"): first row = column headers, first cell of each row = row header.
 * Links to `/modals/info-bulles/...` documents open as tooltips.
 * @param {Element} block
 */
export default function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  [...block.children].forEach((row, r) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell, c) => {
      const el = document.createElement(r === 0 || c === 0 ? 'th' : 'td');
      if (r === 0) el.scope = 'col';
      else if (c === 0) el.scope = 'row';
      el.append(...cell.childNodes);
      tr.append(el);
    });
    (r === 0 ? thead : tbody).append(tr);
  });
  table.append(thead, tbody);

  table.querySelectorAll('a[href*="/modals/info-bulles/"]').forEach((a) => {
    a.classList.add('rates-table-tooltip');
    a.setAttribute('role', 'button');
    a.setAttribute('aria-expanded', 'false');
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (a.getAttribute('aria-expanded') === 'true') closeTooltip();
      else openTooltip(a);
    });
  });
  block.replaceChildren(table);
}
