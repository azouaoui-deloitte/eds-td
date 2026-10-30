import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Big number steps (TD "cmp-big-number"): each row is one step (heading + text),
 * numbered automatically with a large green figure.
 * @param {Element} block
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  [...block.children].forEach((row, i) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    const number = document.createElement('span');
    number.className = 'big-number-figure';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = i + 1;
    const body = document.createElement('div');
    body.className = 'big-number-body';
    [...row.children].forEach((cell) => body.append(...cell.childNodes));
    li.append(number, body);
    ol.append(li);
  });
  block.replaceChildren(ol);
}
