import CustomElement from "../common/CustomElement.js";

export default class Breadcrumb extends CustomElement {
	defaultElements() {
		this.base.li = this.base.li || document.createElement("li");
	}

	addElement(name) {
		const li = this.base.li.cloneNode();
		li.innerHTML = name;

		this.appendElement(li);
	}
}