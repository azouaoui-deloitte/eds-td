/**
 * Geo location notice (TD cmp-geo-location): "current province" sentence and a link opening
 * the province selector (a `/modals/` document, opened by the modal auto-link).
 * The province is static (content is authored for one province); see SHARED-BLOCKS-W2.md.
 * @param {Element} block
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const p = cell.querySelector('p') || cell;
  p.classList.add('geo-location-text');
  p.querySelectorAll('a').forEach((a) => {
    a.classList.remove('link-action');
    a.classList.add('geo-location-link');
    a.setAttribute('role', 'button');
  });
  block.replaceChildren(p);
}
