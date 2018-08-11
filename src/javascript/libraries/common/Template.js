import CustomElement from "./CustomElement.js";

export default class Template {
	constructor(selector) {
		this.set(selector);
	}

	set(selector) {
		this.element = CustomElement.parseElement(selector);
		this.setStart();
	}

	setStart() {
		this.start = this.element.cloneNode(true);
	}

	replace(selector, text) {
		this.element.querySelector(selector).textContent = text;
	}

	child(selector) {
		return this.element.querySelector(selector);
	}

	reset() {
		this.element = this.start.cloneNode(true);
	}
}