export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1) {
        col.classList.add('columns-img-col');
      } else {
        col.classList.add('columns-text-col');
      }
    });

    // teaser: on mobile the illustration sits between the heading and the text
    if (block.classList.contains('teaser')) {
      const imgCol = row.querySelector('.columns-img-col');
      const heading = row.querySelector('.columns-text-col h2');
      if (imgCol && heading) {
        const mobileImg = document.createElement('div');
        mobileImg.className = 'columns-mobile-img';
        mobileImg.setAttribute('aria-hidden', 'true');
        mobileImg.append(imgCol.querySelector('picture').cloneNode(true));
        heading.after(mobileImg);
      }
    }
  });
}
