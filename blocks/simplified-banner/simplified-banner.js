/**
 * Simplified product banner (TD cmp-simplified-banner-product):
 * illustration on the left, heading and text on the right, call to action centered below.
 * Row: image cell | text cell (heading, paragraphs, button).
 * Buttons found anywhere move to the action row.
 * @param {Element} block
 */
export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'simplified-banner-media';
  const body = document.createElement('div');
  body.className = 'simplified-banner-body';
  const action = document.createElement('div');
  action.className = 'simplified-banner-action';

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      [...cell.children].forEach((node) => {
        if (node.querySelector('picture, img') && !node.textContent.trim()) media.append(node);
        else if (node.classList.contains('button-wrapper')) action.append(node);
        else body.append(node);
      });
      if (cell.tagName === 'PICTURE') media.append(cell);
    });
  });

  block.replaceChildren(media, body);
  if (action.children.length) block.append(action);
}
