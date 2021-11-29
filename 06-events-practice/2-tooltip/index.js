class Tooltip {
  static instance = null;

  onPointerover = (event) => {
    if (event.target.dataset.tooltip) {
      this.render(event.target.dataset.tooltip);

      document.addEventListener('pointermove', this.onPointermove);
    }
  };

  onPointerout = (event) => {
    if (event.target.dataset.tooltip) {
      this.remove();

      document.removeEventListener('pointermove', this.onPointermove);
    }
  };

  onPointermove = (event) => {
    if (event.target.dataset.tooltip) {
      this.render(event.target.dataset.tooltip);
    }
  };

  constructor() {
    if (!Tooltip.instance) {
      this.renderModule();
    }
    else {
      return Tooltip.instance;
    }
  }

  renderModule() {
    const element = document.createElement('div');

    element.innerHTML = `<div class="tooltip"></div>`;
    
    this.element = element.firstElementChild;

    Tooltip.instance = this;
  }

  initialize() {
    this.addEventListeners();
  }

  addEventListeners () {
    document.addEventListener('pointerover', this.onPointerover);
    document.addEventListener('pointerout', this.onPointerout);
  }

  render(tooltipText) {
    this.element.innerHTML = tooltipText;

    if (!document.querySelector(".tooltip")) {
      document.body.append(this.element);
    }  
  }

  remove() {
    this.element.innerHTML = '';
    this.element.remove();
  }

  destroy () {
    this.remove();
  }
}

export default Tooltip;
