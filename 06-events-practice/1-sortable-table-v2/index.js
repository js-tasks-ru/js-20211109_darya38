export default class SortableTable {
  directions = {
    asc: 1,
    desc: -1
  };

  sortOrder = 1;
  currentSortField = '';
  
  onHeaderClick = (event) => {
    let columnId = event.target.dataset.id 
      ? event.target.dataset.id 
      : event.target.closest('div').dataset.id;

    if (columnId) {
      this.sortOrder *= -1; 
      this.sort(columnId, this.sortOrder);
    }
  };

  constructor(
    headersConfig, 
    {
      data = [],
      sorted = {}
    } = {},
    isSortLocally = true) {
    this.headersConfig = headersConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.sorted = sorted;
    this.subElements = {};
    this.isSortLocally = isSortLocally;
    
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

    if (this.sorted.id) {
      this.sortOrder = this.directions[this.sorted.order];
      this.sort(this.sorted.id);
    }
    
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
  }
  
  getHeader() {
    return this.headersConfig
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
    return this.headersConfig
          .map(configEl => { 
            let value = dataElement[configEl.id];

            if (configEl.template) {
              return configEl.template(value);
            }
            else {
              return `<div class="sortable-table__cell">${value}</div>`;
            }
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

  sort (field) {
    if (this.isSortLocally) {
      this.sortOnClient(field);
    } else {
      this.sortOnServer(field);
    }
  }

  sortOnClient(field) {
    const sortHeader = this.headersConfig.find(item => item.id == field);

    if (!sortHeader.sortable) {
      return;
    }

    let arrayToSort = Array.from(this.data);
    switch (sortHeader.sortType) {
    case 'string':
      this.sortStringArray(arrayToSort, field, this.sortOrder);
      break;
    case 'number':
      this.sortNumberArray(arrayToSort, field, this.sortOrder);
      break;
    }

    this.subElements.body.innerHTML = this.getRows(arrayToSort);

    this.setSortedColumn(field);

    return;
  }

  sortOnServer(field) {
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

  setSortedColumn(field) {
    if (this.currentSortField) {
      const columnToRemoveSort = this.element.querySelector(`.sortable-table__cell[data-id="${this.currentSortField}"]`);
      delete columnToRemoveSort.dataset.order;
    }

    const columnToSetSort = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);
    
    if (columnToSetSort) {
      columnToSetSort.dataset.order = Object.keys(this.directions).find(key => this.directions[key] === this.sortOrder);
      this.currentSortField = field;
    }  
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
