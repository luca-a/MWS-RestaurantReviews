class Breadcrumb {
	constructor(element) {
		this.element = element;

		this.createDefaultElements();
	}

	createDefaultElements() {
		this.defaultLi = document.createElement("li");
	}

	addElement(name) {
		const li = this.defaultLi.cloneNode();
		li.innerHTML = name;
		this.element.appendChild(li);
	}
}