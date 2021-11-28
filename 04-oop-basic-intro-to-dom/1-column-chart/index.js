export default class ColumnChart {
  subElements = {};

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = data => data
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;

    this.renderElement();
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

    if (this.data.length == 0) {
      this.setSkeleton();
    }

    this.subElements = this.getSubElements(this.element);
  }

  getLink() {
    return this.link != '' ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  getValue() {
    return this.formatHeading(this.value);
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

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }
  
  update(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.getColumnBody(data);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.element.remove();
    this.data = null;
    this.label = null;
    this.link = null;
    this.value = null;
    this.element = null;
    this.subElements = {};
  }
}
