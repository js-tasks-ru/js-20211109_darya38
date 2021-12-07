import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  directions = {
    asc: 1,
    desc: -1
  };

  sortOrder = 1;
  currentSortField = '';
  
  onHeaderClick = (event) => {
    const columnId = event.target.dataset.id 
      ? event.target.dataset.id 
      : event.target.closest('div').dataset.id;

    if (columnId) {
      this.sortOrder *= -1; 
      const order = this.sortOrder === 1 ? 'asc' : 'desc';
      if (this.isSortLocally) {
        this.sortOnClient(columnId, order);
      }
      else {
        this.sortOnServer(columnId, order);
      } 
    }
  };

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
  
    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);
      this.update(data);

      this.loading = false;
    }
  };

  constructor(
    headersConfig = [], 
    {
      sorted = {
        id: headersConfig.find(item => item.sortable).id,
        order: 'asc'
      },
      url = '',
      isSortLocally = false,
      start = 1,
      step = 20,
      end = start + step
    } = {}) {    
    this.headersConfig = headersConfig;

    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.start = start;
    this.step = step;
    this.end = end;
    
    this.subElements = {};
    this.data = [];
    this.loading = false;

    this.render();
  }

  async render() {
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

    await this.sortOnServer(this.sorted.id, this.sorted.order, this.start, this.end);
    
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
    window.addEventListener('scroll', this.onWindowScroll);
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
            const value = dataElement[configEl.id];

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

  sort (field, order) {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  sortOnClient(field, order) {
    const sortHeader = this.headersConfig.find(item => item.id == field);

    if (!sortHeader.sortable) {
      return;
    }

    const arrayToSort = Array.from(this.data);
    switch (sortHeader.sortType) {
    case 'string':
      this.sortStringArray(arrayToSort, field, order);
      break;
    case 'number':
      this.sortNumberArray(arrayToSort, field, order);
      break;
    }

    this.subElements.body.innerHTML = this.getRows(arrayToSort);

    this.setSortedColumn(field);

    return;
  }

  async sortOnServer(field, order) {
    const start = 1;
    const end = start + this.step;

    const serverData = await this.loadData(field, order, start, end);

    this.data = serverData;
    this.subElements.body.innerHTML = this.getRows(serverData);

    this.setSortedColumn(field);

    return serverData;
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

  async loadData (field, order, start, end) {
    this.url.searchParams.set('_sort', field);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.addSpinner();

    const serverData = await fetchJson(this.url);

    this.removeSpinner();

    return serverData;
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  addSpinner() {
    this.element.classList.add('sortable-table_loading');
  }

  removeSpinner() {
    this.element.classList.remove('sortable-table_loading');
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.subElements = {};
  }
}
