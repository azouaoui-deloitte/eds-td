/**
 * Table: renders the block rows/cells as an HTML table.
 * Merged cells are authored as empty cells: leading empty cells of a row extend the cell above
 * (rowspan), other empty cells extend the cell on their left (colspan).
 * Rows before the first row without empty cells are header rows.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children].map((row) => [...row.children]);
  const isEmpty = (cell) => !cell.textContent.trim() && !cell.querySelector('img');
  const headerCount = Math.max(0, rows.findIndex((cells) => !cells.some(isEmpty)));

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const above = [];

  rows.forEach((cells, r) => {
    const tr = document.createElement('tr');
    const header = r < headerCount;
    let left = null;
    let leading = true;
    cells.forEach((cell, c) => {
      if (isEmpty(cell)) {
        if (leading && above[c]) {
          above[c].rowSpan += 1;
        } else if (left) {
          left.colSpan += 1;
        }
        return;
      }
      leading = false;
      const td = document.createElement(header ? 'th' : 'td');
      if (header) td.scope = 'col';
      td.append(...cell.childNodes);
      tr.append(td);
      left = td;
      above[c] = td;
    });
    (header ? thead : tbody).append(tr);
  });

  if (thead.children.length) table.append(thead);
  table.append(tbody);
  const wrapper = document.createElement('div');
  wrapper.className = 'table-scroll';
  wrapper.append(table);
  block.replaceChildren(wrapper);
}
