import CustomElement from "./CustomElement.js";

export default class AccessibilityList extends CustomElement {
	constructor(selector) {
		super(selector);
	}

	defaultElements() {
		this.base.li = this.base.li || document.createElement("li");
	}

	add(text) {
		let li = this.base.li.cloneNode();

		li.innerHTML = text;

		this.appendElement(li);
	}
}