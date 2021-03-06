import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  };

  onSubmitButtonClick = event => {
    event.preventDefault();

    this.save();
  };

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            Referer: ''
          },
          body: formData
        });

        imageListContainer.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        // Remove input from body
        fileInput.remove();
      }
    });

    // must be in body for IE
    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    await this.getProductFormData();

    this.renderTemplate();

    if (this.data) {
      this.fillProductForm();
      this.addEventListeners();
    }

    return this.element;
  }

  renderTemplate () {
    const element = document.createElement('div');

    element.innerHTML = this.data ? this.getTemplate() : this.getEmptyTemplate();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getTemplate() {
    return `  
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">???????????????? ????????????</label>
              <input required="" id="title" type="text" name="title" class="form-control" placeholder="???????????????? ????????????">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">????????????????</label>
            <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="???????????????? ????????????"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">????????</label>
            <ul class="sortable-list" data-element="imageListContainer">
              ${this.createImagesList()}
            </ul>
            <button data-element="uploadImage" type="button" class="button-primary-outline">
              <span>??????????????????</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">??????????????????</label>
            ${this.createCategoriesSelect()}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">???????? ($)</label>
              <input id="price" required="" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">???????????? ($)</label>
              <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">????????????????????</label>
            <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">????????????</label>
            <select id="status" class="form-control" name="status">
              <option value="1">??????????????</option>
              <option value="0">??????????????????</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? "??????????????????" : "????????????????"} ??????????
            </button>
          </div>
        </form>
      </div>
    `;
  }

  getEmptyTemplate() {
    return `
      <div>
        <h1 class="page-title">???????????????? ???? ??????????????</h1>
        <p>????????????????, ???????????? ?????????? ???? ????????????????????</p>
      </div>
    `;
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

  async getProductFormData () {
    const categoriesPromise = await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);

    let productPromise;
    if (this.productId) {
      productPromise = fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`);
    }
    else {
      productPromise = Promise.resolve(this.defaultFormData);
    }

    const [categoriesResponse, productResponse] = await Promise.all([categoriesPromise, productPromise]);

    const [productData] = productResponse; 

    this.categories = categoriesResponse;
    this.data = productData;
  } 

  fillProductForm() {
    const keys = Object.keys(this.defaultFormData).filter(item => item !== 'images'); 
    for (const key of keys) {
      this.element.querySelector(`#${key}`).value = this.data[key];
    }
  }

  createCategoriesSelect () {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    for (const category of this.categories) {
      for (const child of category.subcategories) {
        select.append(new Option(`${category.title} > ${child.title}`, child.id));
      }
    }

    return select.outerHTML;
  }

  addEventListeners () {
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    this.subElements.uploadImage.addEventListener('click', this.uploadImage);

    this.subElements.imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
  }

  createImagesList () {
    return this.data.images.map(item => {
      return this.getImageItem(item.url, item.source).outerHTML;
    }).join('');
  }

  getImageItem (url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error('something went wrong', error);
    }
  }
  
  getFormData () {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);

      values[field] = formatToNumber.includes(field)
        ? parseInt(value)
        : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
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
