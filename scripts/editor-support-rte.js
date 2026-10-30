/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
/* eslint-disable import/prefer-default-export */

// group editable texts in single wrappers if applicable.
// this script should execute after script.js but before the the universal editor cors script
// and any block being loaded

function setRichtextInstrumentation(target, {
  richtextResource, richtextProp, richtextFilter, richtextLabel,
}) {
  if (richtextResource) {
    target.dataset.aueResource = richtextResource;
    target.dataset.aueBehavior = 'component';
  }
  if (richtextProp) target.dataset.aueProp = richtextProp;
  if (richtextLabel) target.dataset.aueLabel = richtextLabel;
  if (richtextFilter) target.dataset.aueFilter = richtextFilter;
  target.dataset.aueType = 'richtext';
}

export function decorateRichtext(container = document) {
  function deleteInstrumentation(element) {
    delete element.dataset.richtextResource;
    delete element.dataset.richtextProp;
    delete element.dataset.richtextFilter;
    delete element.dataset.richtextLabel;
  }

  // block cells holding a single element are instrumented on the cell itself
  container.querySelectorAll('div[data-richtext-prop]').forEach((cell) => {
    const data = { ...cell.dataset };
    deleteInstrumentation(cell);
    setRichtextInstrumentation(cell, data);
  });

  let element;
  while (element = container.querySelector('[data-richtext-prop]:not(div)')) {
    const data = { ...element.dataset };
    const {
      richtextResource,
      richtextProp,
    } = data;
    deleteInstrumentation(element);
    const siblings = [];
    let sibling = element;
    while (sibling = sibling.nextElementSibling) {
      if (sibling.dataset.richtextResource === richtextResource
        && sibling.dataset.richtextProp === richtextProp) {
        deleteInstrumentation(sibling);
        siblings.push(sibling);
      } else break;
    }

    // keep the authored DOM (blocks and CSS rely on direct children): instrument the block cell
    // holding the whole richtext, or the element itself when the richtext is a single element
    const group = [element, ...siblings];
    const parent = element.parentElement;
    if (!richtextResource && parent && !parent.dataset.aueResource
      && [...parent.children].every((child) => group.includes(child))) {
      setRichtextInstrumentation(parent, data);
    } else if (group.length === 1) {
      setRichtextInstrumentation(element, data);
    } else {
      let orphanElements;
      if (richtextResource && richtextProp) {
        orphanElements = document.querySelectorAll(`[data-richtext-id="${richtextResource}"][data-richtext-prop="${richtextProp}"]`);
      } else {
        const editable = element.closest('[data-aue-resource]');
        if (editable) {
          orphanElements = editable.querySelectorAll(`:scope > :not([data-aue-resource]) [data-richtext-prop="${richtextProp}"]`);
        } else {
          console.warn(`Editable parent not found or richtext property ${richtextProp}`);
          return;
        }
      }

      if (orphanElements.length) {
        console.warn('Found orphan elements of a richtext, that were not consecutive siblings of '
          + 'the first paragraph', orphanElements);
        orphanElements.forEach((orphanElement) => deleteInstrumentation(orphanElement));
      } else {
        const wrapper = document.createElement('div');
        setRichtextInstrumentation(wrapper, data);
        element.replaceWith(wrapper);
        wrapper.append(element, ...siblings);
      }
    }
  }
}
