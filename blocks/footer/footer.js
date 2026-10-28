import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const SECTION_CLASSES = ['footer-quick', 'footer-contact', 'footer-columns', 'footer-legal', 'footer-social', 'footer-disclaimers'];

function unwrapListParagraphs(root) {
  root.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
  root.querySelectorAll('li a').forEach((a) => a.classList.remove('link-action', 'button', 'primary', 'secondary'));
}

/** Turns h3 + list pairs into columns that collapse to accordions below 1024px. */
function buildColumns(section) {
  const wrapper = section.querySelector('.default-content-wrapper');
  const columns = document.createElement('div');
  columns.className = 'footer-columns-list';
  wrapper.querySelectorAll('h3').forEach((h3, i) => {
    const list = h3.nextElementSibling;
    const id = `footer-col-${i}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'footer-column-title';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', id);
    button.innerHTML = `<span>${h3.textContent}</span><span class="icon icon-down-caret" aria-hidden="true" style="--icon: url(${window.hlx.codeBasePath}/icons/down-caret.svg)"></span>`;
    button.addEventListener('click', () => {
      button.setAttribute('aria-expanded', button.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    });
    const col = document.createElement('div');
    col.className = 'footer-column';
    if (list) list.id = id;
    col.append(button, list);
    columns.append(col);
  });
  wrapper.replaceChildren(columns);
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  const top = document.createElement('div');
  top.className = 'footer-top';
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';

  [...fragment.children].forEach((section, i) => {
    section.classList.add(SECTION_CLASSES[i] || `footer-section-${i}`);
    unwrapListParagraphs(section);
    if (i === 2) buildColumns(section);
    (i < 4 ? top : bottom).append(section);
  });

  // contact + columns sit side by side on desktop
  const support = document.createElement('div');
  support.className = 'footer-support';
  const contact = top.querySelector('.footer-contact');
  const columns = top.querySelector('.footer-columns');
  if (contact && columns) {
    contact.before(support);
    support.append(contact, columns);
  }

  const backToTop = top.querySelector('.footer-quick a[href="#main"]');
  if (backToTop) {
    backToTop.classList.remove('link-action');
    backToTop.classList.add('footer-back-to-top');
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const main = document.querySelector('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
      }
    });
  }

  bottom.querySelectorAll('.footer-social a').forEach((a) => {
    a.setAttribute('aria-label', a.title);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
  bottom.querySelectorAll('.footer-social p a, .footer-disclaimers a').forEach((a) => {
    if (!a.href.includes('td.com')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
  bottom.querySelectorAll('.footer-disclaimers a[href$=".pdf"]').forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  footer.append(top, bottom);
  block.append(footer);
}
