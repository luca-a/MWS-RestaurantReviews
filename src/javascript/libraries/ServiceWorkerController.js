/* wrapper for the ServiceWorker based off wittr implementation */
class ServiceWorkerController {
	constructor(file, toasts) {
		this.file = file || "";
		this.toastsView = toasts;
	}

	register() {
		let sw = false;

		if(navigator.serviceWorker) {
			sw = navigator.serviceWorker.register(this.file);
		} else {
			return Promise.reject("serviceWorker API is not implemented");
		}

		return sw;
	}

	/* similar to wittr IndexController _checkUpdate method */
	checkUpdate() {
		let result = this.register();

		//if(!result) return;

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
		
			registration.addEventListener("updatefound", (event) => {
				if(registration.installing) {
					this.trackInstalling(registration.installing);
				}
				
				if(event.currentTarget.waiting) {
					this.updatePending(event.currentTarget.waiting);
				}
			});
		}).catch(error => {
			window.console.log(error);
		});

		this.refreshListener();
	}

	/* on controller change refresh the page */
	refreshListener() {
		navigator.serviceWorker.addEventListener("controllerchange", event => {	  
			if(this.refreshing) return;

			location.reload();

			this.refreshing = true;
		});
	}

	/* similar to wittr IndexController _updateReady method */
	updatePending(sw) {
		this.toastsView
			.show("WebApp version", "A new version is available", ["update", "dismiss"])
			.then(answer => {
				if(answer != "update") return;

				sw.postMessage("refresh");
			});
	}

	/* similar to wittr IndexController _trackInstalling method */
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