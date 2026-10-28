/**
 * FAQ search: heading, input placeholder, submit button (link to the results page)
 * and an optional secondary link.
 * @param {Element} block
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  const heading = cell.querySelector('h2, h3');
  const paragraphs = [...cell.querySelectorAll(':scope > p')];
  const submitLink = cell.querySelector('a.button');
  const secondary = paragraphs.find((p) => p.querySelector('a.link-action'));
  const placeholder = paragraphs.find((p) => !p.querySelector('a'));

  const form = document.createElement('form');
  form.className = 'faq-search-form';
  form.setAttribute('role', 'search');
  const action = submitLink ? new URL(submitLink.href) : null;
  if (action) {
    form.action = `${action.origin}${action.pathname}`;
    form.method = 'get';
  }

  const field = document.createElement('div');
  field.className = 'faq-search-field';
  const label = document.createElement('label');
  label.className = 'visually-hidden';
  label.htmlFor = 'faq-search-input';
  label.textContent = placeholder ? placeholder.textContent.trim() : '';
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'faq-search-input';
  input.name = (action && [...action.searchParams.keys()][0]) || 'query';
  input.placeholder = label.textContent;
  input.autocomplete = 'off';
  const icon = document.createElement('span');
  icon.className = 'icon icon-search';
  icon.setAttribute('aria-hidden', 'true');
  icon.style.setProperty('--icon', `url(${window.hlx.codeBasePath}/icons/search.svg)`);
  field.append(label, input, icon);

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'button primary';
  button.textContent = submitLink ? submitLink.textContent.trim() : '';

  form.append(field, button);
  form.addEventListener('submit', (e) => {
    if (!input.value.trim()) {
      e.preventDefault();
      input.focus();
    }
  });

  const content = document.createElement('div');
  content.className = 'faq-search-content';
  if (heading) content.append(heading);
  content.append(form);
  if (secondary) content.append(secondary);
  block.replaceChildren(content);
}
