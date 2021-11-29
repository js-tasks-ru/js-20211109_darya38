export default class SortableTable {
  directions = {
    asc: 1,
    desc: -1
  };

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.subElements = {};
    
    this.renderElement();
  }

  renderElement() {
    const element = document.createElement('div');

    element.innerHTML = `
    <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeader()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getRows(this.data)}
        </div>
    </div>
    `;

    this.element = element.firstElementChild;
   
    this.subElements = this.getSubElements(element);
  }
  
  getHeader() {
    return this.headerConfig
      .map(el => { 
        return `
          <div class="sortable-table__cell" data-id=${el.id} data-sortable="${el.sortable}">
            <span>${el.title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>
          </div>`;
      }).join('');
  }

  getRows(data) {
    return data
      .map((dataEl) => {
        return `<a href="" class="sortable-table__row">${this.getCells(dataEl)}</a>`;
      }).join('');
  }

  getCells(dataElement) {
    return this.headerConfig
          .map(configEl => { 
            let value = dataElement[configEl.id];

            return configEl.template ? configEl.template(value) : `<div class="sortable-table__cell">${value}</div>`;
          }).join('');
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  sort(field, order) {
    const sortHeader = this.headerConfig.find(item => item.id == field);

    if (!sortHeader.sortable) {
      return;
    }

    const direction = this.directions[order];

    const arrayToSort = Array.from(this.data);
    switch (sortHeader.sortType) {
    case 'string':
      this.sortStringArray(arrayToSort, field, direction);
      break;
    case 'number':
      this.sortNumberArray(arrayToSort, field, direction);
      break;
    }

    this.removeSortingArray(field, order);

    this.subElements.body.innerHTML = this.getRows(arrayToSort);

    return;
  }

  sortStringArray (arrayToSort, field, direction) {
    return arrayToSort.sort((a, b) => {
      return direction * a[field].localeCompare(b[field], ['ru', 'en']);
    });
  }

  sortNumberArray (arrayToSort, field, direction) {
    return arrayToSort.sort((a, b) => {
      return direction * (a[field] - b[field]);
    });
  }

  getSortedRows(rows) {
    return rows
      .map((row) => {
        return row.outerHTML;
      })
      .join('');
  }

  removeSortingArray (field, order) {
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
