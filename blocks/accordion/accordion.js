import { moveInstrumentation } from '../../scripts/scripts.js';

const DURATION = 700;
let idCount = 0;

function toggle(button, panel, expand) {
  button.setAttribute('aria-expanded', expand);
  button.closest('.accordion-item').classList.toggle('expanded', expand);
  clearTimeout(panel.timer);
  if (expand) panel.hidden = false;
  panel.style.maxHeight = `${expand ? 0 : panel.scrollHeight}px`;
  // commit the start height so the transition runs
  panel.getBoundingClientRect();
  panel.style.maxHeight = `${expand ? panel.scrollHeight : 0}px`;
  panel.timer = setTimeout(() => {
    if (expand) panel.style.maxHeight = 'none';
    else panel.hidden = true;
  }, DURATION);
}

/**
 * TD FAQ accordion. Rows: question | answer.
 * Several questions can be open at once.
 * @param {Element} block
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const [questionCell, answerCell] = [...row.children];
    idCount += 1;
    const id = `accordion-${idCount}`;

    const item = document.createElement('div');
    item.className = 'accordion-item';
    moveInstrumentation(row, item);

    const heading = document.createElement('h3');
    heading.className = 'accordion-header';
    const button = document.createElement('button');
    button.type = 'button';
    button.id = `${id}-button`;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `${id}-panel`);
    const icon = document.createElement('span');
    icon.className = 'accordion-icon';
    icon.setAttribute('aria-hidden', 'true');
    const title = document.createElement('span');
    title.className = 'accordion-title';
    if (questionCell) {
      moveInstrumentation(questionCell, title);
      const single = questionCell.children.length === 1 && questionCell.firstElementChild;
      title.append(...(single && /^(P|H\d)$/.test(single.tagName) ? single : questionCell).childNodes);
    }
    button.append(icon, title);
    heading.append(button);

    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', button.id);
    panel.hidden = true;
    const body = document.createElement('div');
    body.className = 'accordion-body';
    if (answerCell) {
      moveInstrumentation(answerCell, body);
      body.append(...answerCell.childNodes);
    }
    panel.append(body);

    button.addEventListener('click', () => toggle(button, panel, button.getAttribute('aria-expanded') !== 'true'));

    item.append(heading, panel);
    return item;
  });
  block.replaceChildren(...items);
}
