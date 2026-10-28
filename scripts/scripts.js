import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Renders icons as CSS masks so they inherit the text color (hover / active states).
 * @param {Element} element Element containing decorated icons
 */
export function decorateIconMasks(element) {
  element.querySelectorAll('span.icon').forEach((span) => {
    const name = [...span.classList].find((c) => c.startsWith('icon-'));
    if (!name || name.startsWith('icon-flag-') || span.style.getPropertyValue('--icon')) return;
    span.style.setProperty('--icon', `url(${window.hlx.codeBasePath}/icons/${name.substring(5)}.svg)`);
  });
}

/**
 * Builds an art-directed picture from several authored images.
 * Images are ordered from the widest breakpoint to the smallest one.
 * @param {HTMLImageElement[]} imgs authored images
 * @param {number[]} breakpoints min-widths matching each image except the last
 * @param {boolean} eager load eagerly (LCP)
 * @returns {HTMLPictureElement}
 */
export function buildArtDirectedPicture(imgs, breakpoints, eager = false) {
  const picture = document.createElement('picture');
  imgs.forEach((authored, i) => {
    const { pathname } = new URL(authored.src, window.location.href);
    const ext = pathname.substring(pathname.lastIndexOf('.') + 1);
    const width = i < imgs.length - 1 ? 2000 : 750;
    const media = i < imgs.length - 1 ? `(min-width: ${breakpoints[i]}px)` : '';
    const webp = document.createElement('source');
    webp.type = 'image/webp';
    webp.srcset = `${pathname}?width=${width}&format=webply&optimize=medium`;
    if (media) webp.media = media;
    picture.append(webp);
    if (media) {
      const source = document.createElement('source');
      source.srcset = `${pathname}?width=${width}&format=${ext}&optimize=medium`;
      source.media = media;
      picture.append(source);
    } else {
      const img = document.createElement('img');
      img.src = `${pathname}?width=${width}&format=${ext}&optimize=medium`;
      img.alt = authored.alt;
      img.loading = eager ? 'eager' : 'lazy';
      if (authored.getAttribute('width')) img.width = authored.getAttribute('width');
      if (authored.getAttribute('height')) img.height = authored.getAttribute('height');
      picture.append(img);
    }
  });
  return picture;
}

/**
 * Decorates formatted links to style them as buttons.
 * Bold links become primary buttons, italic links secondary buttons and
 * plain standalone links TD "link actions" (green link with a chevron).
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    const hasImage = [...a.querySelectorAll('img')].some((img) => !img.closest('.icon'));
    if (hasImage || p.textContent.trim() !== text) return;

    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) {
      if (!a.querySelector('.icon')) a.classList.add('link-action');
      return;
    }

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  decorateIconMasks(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'fr';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

/**
 * Opens links to `/modals/...` documents in a dialog.
 * @param {Document} doc
 */
function autolinkModals(doc) {
  doc.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');
    if (!origin || !origin.href || !origin.href.includes('/modals/')) return;
    e.preventDefault();
    const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
    openModal(new URL(origin.href).pathname, origin);
  });
}

autolinkModals(document);

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
