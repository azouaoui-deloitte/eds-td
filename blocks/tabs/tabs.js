let tabsCount = 0;

/**
 * Normalises a tab label for matching with section metadata.
 * @param {string} text
 * @returns {string}
 */
function key(text) {
  return (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Tabs (TD "cmp-tabs").
 * One row per tab: first cell = label, optional second cell = panel content.
 * Sections placed after the block with section metadata `Tab` = label are also
 * attached to that tab (shown only while the tab is active), which allows blocks inside panels.
 * @param {Element} block
 */
export default function decorate(block) {
  tabsCount += 1;
  const id = `tabs-${tabsCount}`;
  const section = block.closest('.section');

  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'tabs-panels';

  const tabs = [...block.children].map((row, i) => {
    const [labelCell, contentCell] = row.children;
    const label = labelCell ? labelCell.textContent.trim() : `${i + 1}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-tab';
    button.id = `${id}-tab-${i}`;
    button.setAttribute('role', 'tab');
    const span = document.createElement('span');
    span.className = 'tabs-label';
    span.textContent = label;
    button.append(span);
    tablist.append(button);

    const targets = [];
    if (contentCell && (contentCell.textContent.trim() || contentCell.querySelector('img, picture'))) {
      const panel = document.createElement('div');
      panel.className = 'tabs-panel';
      panel.append(...contentCell.childNodes);
      panels.append(panel);
      targets.push(panel);
    }
    if (section) {
      let next = section.nextElementSibling;
      while (next) {
        if (key(next.dataset.tab) === key(label)) {
          next.classList.add('tabs-section');
          targets.push(next);
        }
        next = next.nextElementSibling;
      }
    }
    targets.forEach((t, j) => {
      if (!t.id) t.id = `${id}-panel-${i}-${j}`;
      t.setAttribute('role', 'tabpanel');
      t.setAttribute('aria-labelledby', button.id);
    });
    button.setAttribute('aria-controls', targets.map((t) => t.id).join(' '));
    return { button, targets };
  });

  const select = (index, focus = false) => {
    tabs.forEach(({ button, targets }, i) => {
      const active = i === index;
      button.setAttribute('aria-selected', active);
      button.tabIndex = active ? 0 : -1;
      button.classList.toggle('active', active);
      targets.forEach((t) => { t.hidden = !active; });
    });
    if (focus) tabs[index].button.focus();
    const { button } = tabs[index];
    const { scrollLeft, clientWidth } = tablist;
    const { offsetLeft, offsetWidth } = button;
    if (offsetLeft < scrollLeft || offsetLeft + offsetWidth > scrollLeft + clientWidth) {
      tablist.scrollTo({ left: offsetLeft - (clientWidth - offsetWidth) / 2, behavior: 'smooth' });
    }
  };

  tabs.forEach(({ button }, i) => {
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', (e) => {
      const last = tabs.length - 1;
      let next = null;
      if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
      if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = last;
      if (next !== null) {
        e.preventDefault();
        select(next, true);
      }
    });
  });

  block.replaceChildren(tablist, panels);
  if (!panels.children.length) block.classList.add('tabs-sections');
  if (tabs.length) select(0);
}
