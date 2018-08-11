export default class CustomWebWorker {
	constructor(file = "") {
		this.file = file;

		this.worker = new Worker(this.file);

		this.autoinc = 0;
		this.resolves = [];
		this.rejects = [];

		const resolves = this.resolves;

		this.worker.addEventListener("message", event => {
			let data = event.data;

			resolves[data.id](data.result);
		});
	}

	call(fn, data) {
		return new Promise(resolve => {
			let id = this.autoinc++;

			this.resolves[id] = resolve;

			this.worker.postMessage({
				id,
				fn,
				arguments: data
			});
		});
	}
}