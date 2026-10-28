import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 1024px)');

const LABELS = {
  menu: 'Menu',
  close: 'Fermer',
  back: 'Retour',
  segment: 'TD:',
  country: 'pays:',
  language: 'Langue:',
  closeSearch: 'Fermer la recherche',
  selected: 'Sélectionné',
};

function create(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) return;
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  children.flat().forEach((c) => {
    if (c === null || c === undefined) return;
    node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

function icon(name) {
  const span = create('span', { class: `icon icon-${name}`, 'aria-hidden': 'true' });
  if (!name.startsWith('flag-')) span.style.setProperty('--icon', `url(${window.hlx.codeBasePath}/icons/${name}.svg)`);
  else {
    span.append(create('img', {
      src: `${window.hlx.codeBasePath}/icons/${name}.svg`, alt: '', width: 28, height: 16,
    }));
  }
  return span;
}

/** Strips paragraph wrappers and button decoration added by decorateMain inside lists. */
function normalizeList(ul) {
  ul.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
  ul.querySelectorAll('a').forEach((a) => {
    a.classList.remove('link-action', 'button', 'primary', 'secondary');
    a.removeAttribute('title');
  });
  return ul;
}

function iconNameOf(node) {
  const span = node.querySelector('span.icon');
  return span ? [...span.classList].find((c) => c.startsWith('icon-')).substring(5) : null;
}

/** text of an element without nested lists */
function ownText(li) {
  return [...li.childNodes]
    .filter((n) => !(n.nodeType === 1 && (n.tagName === 'UL' || n.tagName === 'OL')))
    .map((n) => n.textContent)
    .join('')
    .trim();
}

function closest(el, sel) {
  return el instanceof Element ? el.closest(sel) : null;
}

/* ------------------------------------------------------------------ */
/* parsing                                                              */
/* ------------------------------------------------------------------ */

function parseNav(fragment) {
  const sections = [...fragment.children];
  const [segSection, brandSection, toolsSection, tabsSection] = sections;

  const segments = [...normalizeList(segSection.querySelector('ul')).children].map((li) => {
    const a = li.querySelector('a');
    return { text: a.textContent.trim(), href: a.href, active: !!li.querySelector('strong') };
  });

  const pictures = [...brandSection.querySelectorAll('picture')];
  const brandLink = brandSection.querySelector('a');
  const brand = {
    desktop: pictures[0],
    mobile: pictures[1] || pictures[0],
    href: brandLink ? brandLink.href : '/',
    label: brandLink ? brandLink.textContent.trim() : '',
  };

  const toolItems = [...normalizeList(toolsSection.querySelector('ul')).children];
  const tools = toolItems.map((li) => {
    const sub = li.querySelector(':scope > ul');
    const directLink = li.querySelector(':scope > a');
    const item = {
      icon: iconNameOf(directLink || li),
      label: ownText(directLink || li),
      href: directLink ? directLink.href : null,
    };
    if (sub) {
      item.items = [...sub.children].map((x) => {
        const a = x.querySelector('a');
        return {
          text: a.textContent.trim(),
          href: a.href,
          icon: iconNameOf(a),
          active: !!x.querySelector('strong'),
        };
      });
    }
    return item;
  });

  const tabs = [...normalizeList(tabsSection.querySelector('ul')).children].map((li) => {
    const a = li.querySelector('a');
    return { label: a.textContent.trim(), icon: iconNameOf(a), path: new URL(a.href).pathname };
  });

  return {
    segments,
    brand,
    search: tools[0],
    links: tools.slice(1, 3),
    country: tools[3],
    language: tools[4],
    start: tools[5],
    tabs,
  };
}

/** Splits a mega-menu fragment into columns (h3 + list) and promotions. */
function parseFlyout(fragment) {
  const columns = [];
  fragment.querySelectorAll('.default-content-wrapper h3').forEach((h3) => {
    const ul = h3.nextElementSibling && h3.nextElementSibling.tagName === 'UL' ? h3.nextElementSibling : null;
    const links = ul ? [...normalizeList(ul).children].map((li) => {
      const a = li.querySelector('a');
      return {
        text: a.textContent.trim(), href: a.href, icon: iconNameOf(a), action: !!li.querySelector('strong'),
      };
    }) : [];
    columns.push({ title: h3.textContent.trim(), links });
  });
  const promos = fragment.querySelector('.cards.promo');
  return { columns, promos };
}

/* ------------------------------------------------------------------ */
/* builders                                                             */
/* ------------------------------------------------------------------ */

function linkNode(link, cls) {
  const a = create('a', { href: link.href, class: cls });
  if (link.icon) a.append(icon(link.icon));
  a.append(create('span', { class: 'nav-link-text' }, link.text));
  if (link.action) a.classList.add('link-action');
  return a;
}

function buildFlyoutColumns(columns, accordion) {
  const wrapper = create('div', { class: 'nav-flyout-columns', 'data-columns': columns.length });
  columns.forEach((col, i) => {
    const list = create('ul', { class: 'nav-flyout-links' }, col.links.map((l) => create('li', {}, linkNode(l))));
    let title;
    if (accordion) {
      const id = `nav-acc-${Math.random().toString(36).slice(2, 8)}`;
      title = create('button', {
        type: 'button', class: 'nav-flyout-title', 'aria-expanded': i === 0 ? 'true' : 'false', 'aria-controls': id,
      }, col.title, icon('down-caret'));
      list.id = id;
      title.addEventListener('click', () => {
        title.setAttribute('aria-expanded', title.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
      });
    } else {
      title = create('p', { class: 'nav-flyout-title' }, col.title);
    }
    wrapper.append(create('div', { class: 'nav-flyout-column' }, title, list));
  });
  return wrapper;
}

function buildPromos(promos) {
  if (!promos) return null;
  const clone = promos.cloneNode(true);
  clone.querySelectorAll('a').forEach((a) => a.removeAttribute('title'));
  return create('div', { class: 'nav-flyout-promos' }, clone);
}

function buildDropdown(item, cls, { flags = false, labelPrefix = null } = {}) {
  const id = `nav-dd-${cls}`;
  const button = create(
    'button',
    {
      type: 'button', class: 'nav-dropdown-button', 'aria-expanded': 'false', 'aria-controls': id,
    },
    item.icon && cls !== 'start' ? icon(item.icon) : null,
    labelPrefix ? create('span', { class: 'nav-dropdown-prefix' }, labelPrefix) : null,
    create('span', { class: 'nav-dropdown-label' }, item.label),
    create('span', { class: 'nav-caret', 'aria-hidden': 'true' }),
  );
  const menu = create('div', { class: 'nav-dropdown-menu', id }, create('ul', {}, item.items.map((x) => {
    const a = create('a', { href: x.href, class: x.active ? 'active' : null, 'aria-current': x.active ? 'true' : null });
    if (flags && x.icon) a.append(icon(x.icon));
    a.append(create('span', { class: 'nav-link-text' }, x.text));
    if (x.active) a.append(icon('check-mark'), create('span', { class: 'visually-hidden' }, LABELS.selected));
    return create('li', {}, a);
  })));
  return create('li', { class: `nav-tool nav-dropdown nav-${cls}` }, button, menu);
}

function buildSearchForm(search, cls) {
  const form = create('form', {
    class: cls, role: 'search', action: search.href, method: 'get',
  });
  const input = create('input', {
    type: 'search', name: 'query', placeholder: search.label, 'aria-label': search.label, autocomplete: 'off',
  });
  const submit = create('button', { type: 'submit', class: 'nav-search-submit', 'aria-label': search.label }, icon('search'));
  form.append(input, submit);
  form.addEventListener('submit', (e) => {
    if (!input.value.trim()) {
      e.preventDefault();
      input.focus();
    }
  });
  return form;
}

/* ------------------------------------------------------------------ */
/* decorate                                                             */
/* ------------------------------------------------------------------ */

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const nav = parseNav(fragment);
  const flyoutData = new Map();

  block.textContent = '';
  const wrapper = create('div', { class: 'nav-wrapper' });
  const navEl = create('nav', { id: 'nav', 'aria-label': 'Navigation principale' });

  /* skip link */
  wrapper.append(create('a', { class: 'nav-skip', href: '#main' }, 'Passer au contenu principal'));

  /* segments (desktop) */
  const segments = create('div', { class: 'nav-segments' }, create('div', { class: 'nav-container' }, create('ul', {}, nav.segments.map((s) => create('li', { class: s.active ? 'active' : null }, create('a', { href: s.href, 'aria-current': s.active ? 'page' : null }, s.text))))));

  /* main bar */
  const hamburger = create('button', {
    type: 'button', class: 'nav-hamburger', 'aria-expanded': 'false', 'aria-controls': 'nav-drawer',
  }, icon('hamburger'), create('span', { class: 'visually-hidden' }, LABELS.menu));
  const brand = create('a', { class: 'nav-brand', href: nav.brand.href, 'aria-label': nav.brand.label });
  if (nav.brand.desktop) {
    const desktopLogo = nav.brand.desktop.cloneNode(true);
    desktopLogo.classList.add('nav-brand-desktop');
    desktopLogo.querySelector('img').loading = 'eager';
    const mobileLogo = nav.brand.mobile.cloneNode(true);
    mobileLogo.classList.add('nav-brand-mobile');
    mobileLogo.querySelector('img').loading = 'eager';
    brand.append(desktopLogo, mobileLogo);
  }

  const searchButton = create('button', {
    type: 'button', class: 'nav-tool-button', 'aria-expanded': 'false', 'aria-controls': 'nav-search',
  }, icon(nav.search.icon || 'search'), create('span', { class: 'visually-hidden' }, nav.search.label));
  const toolsList = create(
    'ul',
    { class: 'nav-tools-list' },
    create('li', { class: 'nav-tool nav-tool-search' }, searchButton),
    nav.links.map((l) => create('li', { class: 'nav-tool' }, create('a', { class: 'nav-tool-button', href: l.href }, icon(l.icon), create('span', { class: 'visually-hidden' }, l.label)))),
    buildDropdown(nav.country, 'country', { flags: true }),
    buildDropdown(nav.language, 'language'),
    buildDropdown(nav.start, 'start'),
  );
  const searchForm = buildSearchForm(nav.search, 'nav-search');
  searchForm.id = 'nav-search';
  const searchClose = create('button', { type: 'button', class: 'nav-search-close', 'aria-label': LABELS.closeSearch }, icon('close'));
  searchForm.append(searchClose);
  const tools = create('div', { class: 'nav-tools' }, toolsList, searchForm);

  const startMobile = create('button', {
    type: 'button', class: 'nav-start-mobile', 'aria-expanded': 'false', 'aria-controls': 'nav-login-drawer',
  }, icon(nav.start.icon || 'avatar'), create('span', {}, nav.start.label));

  const bar = create('div', { class: 'nav-bar' }, create('div', { class: 'nav-container' }, hamburger, brand, tools, startMobile));

  /* desktop tabs */
  const tabsList = create('ul', { class: 'nav-tabs' });
  nav.tabs.forEach((tab, i) => {
    const id = `nav-flyout-${i}`;
    const button = create('button', {
      type: 'button', class: 'nav-tab-button', 'aria-expanded': 'false', 'aria-controls': id,
    }, create('span', {}, tab.label), create('span', { class: 'nav-caret', 'aria-hidden': 'true' }));
    const close = create('button', { type: 'button', class: 'nav-flyout-close' }, create('span', {}, LABELS.close), icon('close'));
    const flyout = create('div', { class: 'nav-flyout', id, hidden: true }, close, create('div', { class: 'nav-flyout-body' }));
    tabsList.append(create('li', { class: 'nav-tab' }, button, flyout));
  });
  const sections = create('div', { class: 'nav-sections' }, create('div', { class: 'nav-container' }, tabsList));

  navEl.append(segments, bar, sections);

  /* mobile drawer */
  const drawerClose = create('button', { type: 'button', class: 'nav-drawer-close' }, icon('close'), create('span', { class: 'visually-hidden' }, LABELS.close));
  const drawerBrand = brand.cloneNode(true);
  const drawerSearch = buildSearchForm(nav.search, 'nav-drawer-search');
  const activeSegment = nav.segments.find((s) => s.active) || nav.segments[0];
  const segmentAccordion = create(
    'div',
    { class: 'nav-drawer-segment' },
    create('button', {
      type: 'button', class: 'nav-accordion-button', 'aria-expanded': 'false', 'aria-controls': 'nav-drawer-segments',
    }, `${LABELS.segment} `, create('strong', {}, activeSegment.text), icon('down-caret')),
    create('ul', { id: 'nav-drawer-segments', class: 'nav-accordion-panel' }, nav.segments.map((s) => create('li', {}, create('a', { href: s.href, 'aria-current': s.active ? 'page' : null }, s.text)))),
  );
  const drawerTabs = create('ul', { class: 'nav-drawer-tabs' }, nav.tabs.map((tab, i) => create('li', {}, create('button', { type: 'button', class: 'nav-drawer-tab', 'data-index': i }, tab.icon ? icon(tab.icon) : null, create('span', {}, tab.label), icon('right-caret')))));
  const level2 = create('div', { class: 'nav-drawer-level2', hidden: true });
  const drawerUtility = create(
    'div',
    { class: 'nav-drawer-utility' },
    create('ul', { class: 'nav-drawer-icons' }, nav.links.map((l) => create('li', {}, create('a', { href: l.href }, icon(l.icon), create('span', {}, l.label))))),
    [
      [nav.country, LABELS.country, true],
      [nav.language, LABELS.language, false],
    ].map(([item, prefix, flags], i) => {
      const id = `nav-drawer-acc-${i}`;
      const active = item.items.find((x) => x.active);
      return create(
        'div',
        { class: 'nav-drawer-accordion' },
        create('button', {
          type: 'button', class: 'nav-accordion-button', 'aria-expanded': 'false', 'aria-controls': id,
        }, `${prefix} `, create('strong', {}, active ? active.text : item.label), icon('down-caret')),
        create('ul', { id, class: 'nav-accordion-panel' }, item.items.map((x) => create('li', {}, create('a', { href: x.href, class: x.active ? 'active' : null }, flags && x.icon ? icon(x.icon) : null, x.text)))),
      );
    }),
  );
  const drawer = create(
    'div',
    { class: 'nav-drawer', id: 'nav-drawer', hidden: true },
    create('div', { class: 'nav-drawer-header' }, drawerClose, drawerBrand),
    create('div', { class: 'nav-drawer-body' }, create('div', { class: 'nav-drawer-search-wrapper' }, drawerSearch), create('div', { class: 'nav-drawer-main' }, segmentAccordion, drawerTabs, level2), drawerUtility),
  );

  /* mobile login drawer */
  const loginClose = create('button', { type: 'button', class: 'nav-drawer-close' }, icon('close'), create('span', { class: 'visually-hidden' }, LABELS.close));
  const loginDrawer = create(
    'div',
    { class: 'nav-login-drawer', id: 'nav-login-drawer', hidden: true },
    create('div', { class: 'nav-drawer-header' }, loginClose, create('p', { class: 'nav-login-title' }, icon(nav.start.icon || 'avatar'), nav.start.label)),
    create('ul', { class: 'nav-login-links' }, nav.start.items.map((x) => create('li', {}, create('a', { href: x.href }, x.text, icon('right-caret'))))),
  );

  const overlay = create('div', { class: 'nav-overlay', hidden: true });

  wrapper.append(navEl, drawer, loginDrawer, overlay);
  block.append(wrapper);

  /* ------------------------------------------------------------------ */
  /* behaviour                                                            */
  /* ------------------------------------------------------------------ */

  const loadFlyout = async (i) => {
    if (!flyoutData.has(i)) {
      const empty = { columns: [], promos: null };
      const pending = loadFragment(nav.tabs[i].path);
      flyoutData.set(i, pending.then((frag) => (frag ? parseFlyout(frag) : empty)));
    }
    return flyoutData.get(i);
  };

  const renderFlyout = async (i) => {
    const flyout = tabsList.children[i].querySelector('.nav-flyout');
    const body = flyout.querySelector('.nav-flyout-body');
    if (body.childElementCount) return;
    const data = await loadFlyout(i);
    body.append(buildFlyoutColumns(data.columns, false));
    const promos = buildPromos(data.promos);
    if (promos) body.append(promos);
  };

  const closeDropdowns = (except) => {
    toolsList.querySelectorAll('.nav-dropdown-button[aria-expanded="true"]').forEach((b) => {
      if (b !== except) b.setAttribute('aria-expanded', 'false');
    });
  };

  const closeFlyouts = (except) => {
    tabsList.querySelectorAll('.nav-tab-button[aria-expanded="true"]').forEach((b) => {
      if (b === except) return;
      b.setAttribute('aria-expanded', 'false');
      document.getElementById(b.getAttribute('aria-controls')).hidden = true;
    });
    if (!except) overlay.hidden = true;
  };

  const closeSearch = () => {
    if (searchButton.getAttribute('aria-expanded') !== 'true') return;
    searchButton.setAttribute('aria-expanded', 'false');
    tools.classList.remove('search-open');
  };

  tabsList.addEventListener('click', async (e) => {
    const button = closest(e.target, '.nav-tab-button');
    const closeBtn = closest(e.target, '.nav-flyout-close');
    if (closeBtn) {
      const tabButton = closeBtn.closest('.nav-tab').querySelector('.nav-tab-button');
      closeFlyouts();
      tabButton.focus();
      return;
    }
    if (!button) return;
    const i = [...tabsList.children].indexOf(button.closest('.nav-tab'));
    const expanded = button.getAttribute('aria-expanded') === 'true';
    closeDropdowns();
    closeSearch();
    if (expanded) {
      closeFlyouts();
      return;
    }
    closeFlyouts(button);
    await renderFlyout(i);
    button.setAttribute('aria-expanded', 'true');
    document.getElementById(button.getAttribute('aria-controls')).hidden = false;
    overlay.hidden = false;
  });

  toolsList.addEventListener('click', (e) => {
    const button = closest(e.target, '.nav-dropdown-button');
    if (!button) return;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    closeFlyouts();
    closeDropdowns(button);
    button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });

  searchButton.addEventListener('click', () => {
    closeFlyouts();
    closeDropdowns();
    searchButton.setAttribute('aria-expanded', 'true');
    tools.classList.add('search-open');
    searchForm.querySelector('input').focus();
  });
  searchClose.addEventListener('click', () => {
    searchForm.querySelector('input').value = '';
    closeSearch();
    searchButton.focus();
  });

  overlay.addEventListener('click', () => closeFlyouts());

  document.addEventListener('click', (e) => {
    if (!closest(e.target, '.nav-dropdown')) closeDropdowns();
  });

  /* mobile drawers */
  const openDrawer = (el, trigger) => {
    el.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-drawer-open');
    const focusable = el.querySelector('button, a, input');
    if (focusable) focusable.focus();
  };
  const closeDrawer = (el, trigger) => {
    if (el.hidden) return;
    el.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-drawer-open');
    trigger.focus();
  };
  const showLevel1 = () => {
    level2.hidden = true;
    level2.textContent = '';
    drawerTabs.hidden = false;
  };

  hamburger.addEventListener('click', () => openDrawer(drawer, hamburger));
  drawerClose.addEventListener('click', () => {
    closeDrawer(drawer, hamburger);
    showLevel1();
  });
  startMobile.addEventListener('click', () => openDrawer(loginDrawer, startMobile));
  loginClose.addEventListener('click', () => closeDrawer(loginDrawer, startMobile));

  drawer.addEventListener('click', (e) => {
    const acc = closest(e.target, '.nav-accordion-button');
    if (acc) acc.setAttribute('aria-expanded', acc.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
  });

  drawerTabs.addEventListener('click', async (e) => {
    const button = closest(e.target, '.nav-drawer-tab');
    if (!button) return;
    const i = Number(button.dataset.index);
    const data = await loadFlyout(i);
    const back = create('button', { type: 'button', class: 'nav-drawer-back' }, icon('arrow-left'), create('span', {}, LABELS.back));
    back.addEventListener('click', () => {
      showLevel1();
      button.focus();
    });
    level2.replaceChildren(
      create('div', { class: 'nav-drawer-back-wrapper' }, back),
      create('p', { class: 'nav-drawer-level2-title' }, nav.tabs[i].label),
      buildFlyoutColumns(data.columns, true),
    );
    const promos = buildPromos(data.promos);
    if (promos) level2.append(promos);
    drawerTabs.hidden = true;
    level2.hidden = false;
    back.focus();
  });

  /* keyboard */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openTab = tabsList.querySelector('.nav-tab-button[aria-expanded="true"]');
    const openDropdown = toolsList.querySelector('.nav-dropdown-button[aria-expanded="true"]');
    if (openTab) {
      closeFlyouts();
      openTab.focus();
    } else if (openDropdown) {
      closeDropdowns();
      openDropdown.focus();
    } else if (tools.classList.contains('search-open')) {
      closeSearch();
      searchButton.focus();
    } else if (!drawer.hidden) {
      closeDrawer(drawer, hamburger);
      showLevel1();
    } else if (!loginDrawer.hidden) {
      closeDrawer(loginDrawer, startMobile);
    }
  });

  isDesktop.addEventListener('change', () => {
    closeFlyouts();
    closeDropdowns();
    closeSearch();
    closeDrawer(drawer, hamburger);
    closeDrawer(loginDrawer, startMobile);
    showLevel1();
  });

  /* warm up the mega-menu fragments once the page is idle */
  const warm = () => nav.tabs.forEach((_, i) => loadFlyout(i));
  if ('requestIdleCallback' in window) window.requestIdleCallback(warm);
  else setTimeout(warm, 2000);
}
