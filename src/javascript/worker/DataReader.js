/* DataReader is used to read generic data from a json file that contains a list of similar items */
class DataReader {
	/* sets the file name and initialize the mapped attribute used to store data */
	constructor(resource) {
		this.resource = resource;
		this.mapped = new Map();
		this.types;
	}

	/* simple wrapper for the fetch method */
	fetch(file) {
		return fetch(file).then(response => {
			return response.json();
		}).catch(error => {
			return Promise.reject(error);
		});
	}

	/* function called by the user to map the data retrieved
	 * options.mapping contains a Map of the attributes to be mapped
	 * options.property is a String that defines the name of the property that contains the array of items
	*/
	store(options) {
		if(options === undefined) return;

		this.types = options.mapping || this.types;

		const fetcher = options.fetcher ? options.fetcher : this.fetch(this.resource);

		return (fetcher.then ? fetcher : fetcher()).then(json => {
			json = options.property ? json[options.property] : json;

			this.mapped = this.map(this.types, typeof json[Symbol.iterator] === "function" ? json : [json]);

			return true;
		});
	}

	/* function that effectively organize the data (using Maps) of the json file making it easier to read afterwards
	 * attributes has to be a Map of the attributes that the user want to organize
	 * array contains the list of items 
	*/
	map(attributes, array) {
		let map = this.mapped, inner, holder, unique = ([...attributes].find(([, v]) => v === "unique") || [])[0];

		for(let [attribute, type] of attributes.entries()) {
			inner = map.get(attribute) || new Map();

			if(type === "unique") {
				for(let item of array) {
					inner.set(item[attribute], item);
				}
			} else {
				for(let item of array) {
					holder = inner.get(item[attribute]) || new Map();

					holder.set(item[unique], item);

					inner.set(item[attribute], holder);
				}
			}

			map.set(attribute, inner);
		}

		return map;
	}

	/* returns a new Iterator object that contains the keys of the specified attribute */
	getKeys(attribute) {
		return Array.from(this.mapped.get(attribute).keys());
	}

	/* returns the value associated to the specified key of the specified attribute */
	getValue(attribute, key) {
		if(key !== undefined) {
			if(this.types.get(attribute) === "unique")
				return this.mapped.get(attribute).get(key);
			else
				return Array.from(this.mapped.get(attribute).get(key) ? this.mapped.get(attribute).get(key).values() : []);
		} else {
			return Array.from(this.mapped.get(attribute).values());
		}
	}

	/* returns an array, the result of the intersection beetween two given arrays */
	static intersect(arrayF, arrayS, key) {
		let result = [];

		for(let item of arrayF) {
			for(let compare of arrayS) {
				if(compare[key] === item[key]) {
					result.push(compare);
				}
			}
		}

		return result;
	}
}