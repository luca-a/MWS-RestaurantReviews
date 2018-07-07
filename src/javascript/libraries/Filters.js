class Filters {
	constructor(elements) {
		this.selects = elements;

		this.createDefaultElement();
	}

	createDefaultElement() {
		this.defaultOption = document.createElement("option");
	}

	setOptions(elementName, values) {
		let select = this.selects.get(elementName);

		for(let key of values) {
			const o = this.defaultOption.cloneNode();

			o.innerHTML = key;
			o.value = key;

			select.appendChild(o);
		}

		this.selects.set(elementName, select);
	}

	getValue(elementName) {
		return this.selects.get(elementName).value;
	}

	setChangeCallback(elementName, callback) {
		let select = this.selects.get(elementName);

		select.addEventListener("change", callback);

		this.selects.set(elementName, select);
	}
}