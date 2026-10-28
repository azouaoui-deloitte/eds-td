import { loadFragment } from '../fragment/fragment.js';
import { loadCSS } from '../../scripts/aem.js';

/**
 * Opens a fragment in a modal dialog.
 * @param {string} path fragment path
 * @param {HTMLElement} [opener] element to refocus on close
 */
// eslint-disable-next-line import/prefer-default-export
export async function openModal(path, opener) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/modal/modal.css`);
  const fragment = await loadFragment(path);
  if (!fragment) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'td-modal';
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
}
