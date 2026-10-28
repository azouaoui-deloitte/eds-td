import { loadFragment } from '../fragment/fragment.js';
import { loadCSS } from '../../scripts/aem.js';

/**
 * Disclaimer anchor: `renvoi-<sup text>` (alphanumerics), or the hexadecimal code points of a
 * symbol-only sup (`^` → `renvoi-u5e`, `†` → `renvoi-u2020`) so symbol footnotes stay distinct.
 * @param {string} text sup text
 * @returns {string}
 */
const toId = (text) => {
  const sup = text.trim();
  const slug = sup.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `renvoi-${slug || [...sup].map((c) => `u${c.codePointAt(0).toString(16)}`).join('-')}`;
};

/**
 * Groups disclaimers: a paragraph starting with a <sup> opens a new `div.disclaimer#renvoi-<sup>`
 * holding it and the following elements up to the next disclaimer.
 * @param {Element} content modal content
 */
function groupDisclaimers(content) {
  content.querySelectorAll('.default-content-wrapper').forEach((wrapper) => {
    let group = null;
    [...wrapper.children].forEach((el) => {
      const first = el.firstElementChild;
      const startsWithSup = el.tagName === 'P' && first && first.tagName === 'SUP'
        && el.textContent.trimStart().startsWith(first.textContent.trim());
      if (startsWithSup) {
        group = document.createElement('div');
        group.className = 'disclaimer';
        const id = toId(first.textContent);
        if (!content.querySelector(`#${CSS.escape(id)}`)) group.id = id;
        el.before(group);
      } else if (/^H[1-6]$/.test(el.tagName)) {
        group = null;
      }
      if (group) group.append(el);
    });
  });
}

/**
 * Scrolls the dialog to the hash target, highlights and focuses it.
 * @param {HTMLDialogElement} dialog
 * @param {string} hash
 */
function focusTarget(dialog, hash) {
  if (!hash || hash.length < 2) return;
  const target = dialog.querySelector(`#${CSS.escape(decodeURIComponent(hash.substring(1)))}`);
  if (!target) return;
  const content = dialog.querySelector('.td-modal-content');
  const scroller = content.scrollHeight > content.clientHeight ? content : dialog;
  const first = content.querySelector('h1, h2, h3, p') || target;
  target.classList.add('focus');
  target.tabIndex = -1;
  scroller.scrollTop = target.offsetTop - first.offsetTop;
  target.focus({ preventScroll: true });
}

/**
 * Opens a fragment in a modal dialog.
 * @param {string} path fragment path
 * @param {HTMLElement} [opener] element to refocus on close (its #hash is focused in the modal)
 */
// eslint-disable-next-line import/prefer-default-export
export async function openModal(path, opener) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/modal/modal.css`);
  const fragment = await loadFragment(path);
  if (!fragment) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'td-modal';
  const kind = (path.split('/modals/')[1] || '').split('/')[0];
  if (kind) dialog.classList.add(`td-modal-${kind}`);
  const heading = fragment.querySelector('h1, h2');
  if (heading) {
    heading.id = heading.id || 'td-modal-title';
    dialog.setAttribute('aria-labelledby', heading.id);
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'td-modal-close';
  close.setAttribute('aria-label', 'Fermer');
  close.innerHTML = `<span class="icon icon-close" style="--icon: url(${window.hlx.codeBasePath}/icons/close.svg)"></span>`;
  close.addEventListener('click', () => dialog.close());

  const content = document.createElement('div');
  content.className = 'td-modal-content';
  content.append(...fragment.childNodes);
  if (kind === 'mentions-juridiques') groupDisclaimers(content);
  dialog.append(close, content);

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    dialog.remove();
    if (opener) opener.focus();
  });

  document.body.append(dialog);
  document.body.classList.add('modal-open');
  dialog.showModal();
  focusTarget(dialog, opener && opener.hash);
}
