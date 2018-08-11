class CustomService {
	constructor(url) {
		this.url = url;
	}

	fetch(...parameters) {
		return fetch(...parameters);
	}

	get(path = "") {
		return this.fetch(this.url + path, {
			method: "GET"
		});
	}

	post(path = "", body = "") {
		return this.fetch(this.url + path, {
			method: "POST",
			body: JSON.stringify(body)
		});
	}

	put(path = "", body = "") {
		return this.fetch(this.url + path, {
			method: "PUT",
			body: JSON.stringify(body)
		});
	}

	delete(path = "") {
		return this.fetch(this.url + path, {
			method: "DELETE"
		});
	}
}