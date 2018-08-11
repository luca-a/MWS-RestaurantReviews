import CustomElement from "../common/CustomElement.js";

export default class Filter extends CustomElement {
	defaultElements() {
		this.base.fragment = this.base.fragment || document.createDocumentFragment();
		this.base.options = document.createElement("option");
	}
	
	set options(options) {
		let optionElement, fragment = this.base.fragment.cloneNode();

		for(let key of options) {
			optionElement = this.base.options.cloneNode();

			optionElement.innerHTML = key;
			optionElement.value = key;

			fragment.appendChild(optionElement);
		}

		this.appendElement(fragment);
	}

	get value() {
		return this.element.value;
	}

	set change(callback) {
		this.element.addEventListener("change", callback);
	}

	/*
	set [event](callback) {
		this.element.addEventListener(event, callback);
	}
	*/
}