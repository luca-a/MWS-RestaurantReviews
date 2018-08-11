export default class CustomElement {
	constructor(selector, container) {
		if(selector)
			this.element = this.constructor.parseElement(selector, container);

		window.restaurant_reviews = window.restaurant_reviews || {};

		this.base = window.restaurant_reviews;

		if(this.defaultElements)
			this.defaultElements();
	}

	static parseElement(selector, container = document) {
		return typeof selector === "string" ? container.querySelector(selector) : selector;
	}

	appendElement(element, container = this.element) {
		requestAnimationFrame(() => {
			container.appendChild(element);
		});
	}

	appendChild(element, container = this.element) {
		container.appendChild(element);
	}

	removeElement(element, container = this.element) {
		requestAnimationFrame(() => {
			container.removeChild(element);
		});
	}

	setElement(selector) {
		this.element = this.constructor.parseElement(selector);
	}

	clear() {
		requestAnimationFrame(() => {
			while(this.element.firstChild) {
				this.element.removeChild(this.element.firstChild);
			}
		});
	}
}