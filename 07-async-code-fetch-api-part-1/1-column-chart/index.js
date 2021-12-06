import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  subElements = {};

  constructor({
    label = '',
    link = '',
    range = {},
    url = '',
    formatHeading = data => data
  } = {}) {
    this.label = label;
    this.link = link;
    this.range = range;
    this.url = new URL(url, BACKEND_URL);
    this.formatHeading = formatHeading;
    
    this.chartHeight = 50;
    this.data = [];

    this.renderElement();
    this.update(this.range.from, this.range.to);
  }

  renderElement() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.getValue()}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody()}
          </div>
          <div data-element="js"></div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;

    this.setSkeleton();

    this.subElements = this.getSubElements(this.element);
  }

  getLink() {
    return this.link !== '' ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  getValue() {
    return this.formatHeading(this.data.reduce((accum, item) => (accum + item), 0));
  }

  getColumnBody() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  setSkeleton() {
    this.element.classList.add('column-chart_loading');
  }

  removeSkeleton() {
    this.element.classList.remove('column-chart_loading');
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
  
  async update(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const serverData = await fetchJson(this.url);

    this.data = Object.values(serverData);
    this.subElements.header.textContent = this.getValue();
    this.subElements.body.innerHTML = this.getColumnBody();
    this.removeSkeleton();

    return serverData;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
