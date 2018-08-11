import Toast from "./Toast.js";

export default class ServiceWorkerController {
	constructor(file = "") {
		this.file = file;

		this.toast = new Toast("#toasts");
		this.toast.set("WebApp update", "A new version is available", ["update", "dismiss"]);
	}

	register() {
		let sw = false;

		if(navigator.serviceWorker) {
			sw = navigator.serviceWorker.register(this.file);
		} else {
			return Promise.reject("ServiceWorker API is not implemented");
		}

		return sw;
	}

	checkUpdate() {
		let result = this.register();

		result.then(registration => {
			this.serviceWorker = true;

			if(!navigator.serviceWorker.controller) return;

			if(registration.waiting) {
				this.updatePending(registration.waiting);
			}
		
			if(registration.installing) {
				this.trackInstalling(registration.installing);
				return;
			}

			registration.sync.register("sync-actions");
		
			registration.addEventListener("updatefound", (event) => {
				if(registration.installing) {
					this.trackInstalling(registration.installing);
				}
				
				if(event.currentTarget.waiting) {
					this.updatePending(event.currentTarget.waiting);
				}
			});
		}).then(() => {

		}).catch(error => {
			window.console.log(error);
		});

		this.refreshListener();
	}

	refreshListener() {
		navigator.serviceWorker.addEventListener("controllerchange", event => {	  
			if(this.refreshing) return;

			location.reload();

			this.refreshing = true;
		});
	}

	updatePending(sw) {
		this.toast.show()
			.then(answer => {
				if(answer !== "update") return;

				sw.postMessage("refresh");
			});
	}

	trackInstalling(sw) {
		if(sw) {
			sw.addEventListener("statechange", event => {
				if(sw.state === "installed") {
					this.updatePending(sw);
				}
			});
		}
	}
}