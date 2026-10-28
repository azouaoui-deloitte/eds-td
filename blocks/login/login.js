/**
 * Login panel: one row per online service (heading, sign-in button, helper links).
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'login-service';
    const cell = row.firstElementChild;
    const links = [...cell.querySelectorAll(':scope > p:not(.button-wrapper)')]
      .filter((p) => p.querySelector('a.link-action'));
    if (links.length) {
      const group = document.createElement('div');
      group.className = 'login-links';
      group.append(...links);
      cell.append(group);
    }
  });
}
