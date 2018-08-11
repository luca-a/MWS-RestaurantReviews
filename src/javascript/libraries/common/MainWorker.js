import CustomWebWorker from "./CustomWebWorker.js";
import { workerSettings } from "../configuration/settings.js";

let instance;

const createInstance = () => {
	let worker = new CustomWebWorker(workerSettings.file);

	let promise = worker.call("url", workerSettings.url);

	return worker;
};

const getInstance = () => {
	if(!instance) {
		instance = createInstance();
	}

	return instance;
}

export default getInstance();