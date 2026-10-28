function icon(name) {
  const span = document.createElement('span');
  span.className = `icon icon-${name}`;
  span.setAttribute('aria-hidden', 'true');
  span.style.setProperty('--icon', `url(${window.hlx.codeBasePath}/icons/${name}.svg)`);
  return span;
}

/**
 * TD inline notification: status icon, message and a close button.
 * Cell: the message (paragraphs, links). Variant `info` swaps the status icon.
 * @param {Element} block
 */
export default function decorate(block) {
  const message = document.createElement('div');
  message.className = 'notification-message';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => message.append(...cell.childNodes));

  const status = document.createElement('div');
  status.className = 'notification-icon';
  status.append(icon(block.classList.contains('info') ? 'info' : 'error'));

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'notification-close';
  close.setAttribute('aria-label', 'Fermer');
  close.append(icon('close'));
  close.addEventListener('click', () => {
    const wrapper = block.closest('.notification-wrapper') || block;
    wrapper.hidden = true;
  });

  const inner = document.createElement('div');
  inner.className = 'notification-inner';
  inner.append(status, message, close);
  block.setAttribute('role', 'status');
  block.replaceChildren(inner);
}
