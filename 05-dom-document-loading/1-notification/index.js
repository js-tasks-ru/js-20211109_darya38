export default class NotificationMessage {
  constructor(message, {
    duration = 0,
    type = ''
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.renderElement();
  }

  renderElement () {
    if (this.element) {
      this.remove();
    }

    const element = document.createElement('div');

    element.innerHTML = `
      <div class="notification" style="--value:${this.duration}">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;  

    if (this.type) {
      this.element.classList.add(this.type);
    }
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  show (div) {
    if (div) {
      div.appendChild(this.element);
    }
    else {
      document.body.append(this.element);
    }

    setTimeout(this.remove.bind(this), this.duration);
  }

  destroy() {
    this.element.remove();
  }
}
