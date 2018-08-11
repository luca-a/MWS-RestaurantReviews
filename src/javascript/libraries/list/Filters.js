import Filter from "./Filter.js";

export default class Filters {
	constructor(elements) {
		this.selects = new Map();

		for(let key of Object.keys(elements)) {
			this.selects.set(key, new Filter(elements[key]));
		}
	}

	setOptions(element, values) {
		this.selects.get(element).options = values;
	}

	getValue(element) {
		return this.selects.get(element).value;
	}

	change(element, callback) {
		this.selects.get(element).change = callback;
	}
}