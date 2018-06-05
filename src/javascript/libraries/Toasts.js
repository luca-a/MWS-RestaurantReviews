/* simple class to show toast
*/
class Toasts {
	constructor(container) {
		this.container = container || document.getElementsByClassName("toasts")[0];

		this.defaultElement;
		this.defaultContent;

		this.buttons = [];

		this.createDefaultElement();
	}

	createDefaultElement() {
		this.defaultElement = document.createElement("div");
		this.defaultElement.className = "toast";
		this.defaultElement.style.display = "inherit";

		this.defaultContent = document.createElement("div");
		this.defaultContent.className = "toast-content";

		this.defaultButton = document.createElement("button");
		this.defaultButton.className = "unbutton";
	}

	createToast(label, desciption, buttons) {
		let element = this.defaultElement.cloneNode();

		let id = label.replace("\\s/g", "_");

		let contentElement = this.defaultContent.cloneNode();
		contentElement.setAttribute("id", id);
		contentElement.innerHTML = desciption;

		let buttonsFragment = document.createDocumentFragment();

		for(const button of buttons) {
			let temp = this.defaultButton.cloneNode();

			temp.innerHTML = button;

			this.buttons.push(temp);

			buttonsFragment.appendChild(temp);
		}

		element.setAttribute("aria-label", label);
		element.setAttribute("aria-describedby", id);

		element.appendChild(contentElement);
		element.appendChild(buttonsFragment);

		return element;
	}

	show(label, desciption, text, buttons) {
		// Save current focus
		this.lastFocusedElement = document.activeElement;

		const element = this.createToast(label, desciption, text, buttons);

		this.container.appendChild(element);

		this.buttons[0].focus();

		this.container.addEventListener("keydown", event => {
			if(event.keyCode === 9) {
				if(event.shiftKey) {
					if(document.activeElement === this.buttons[0]) {
						event.preventDefault();
						this.buttons[this.buttons.length - 1].focus();
					}
				} else {
					if(document.activeElement === this.buttons[this.buttons.length - 1]) {
						event.preventDefault();
						this.buttons[0].focus();
					}
				}
			}
	
			if (event.keyCode === 27) {
				this.close();
			}
		});

		return new Promise(resolve => {
			element.addEventListener("click", event => {
				if(event.target.nodeName === "BUTTON") {
					resolve(event.target.innerHTML);
					this.close();
				}
			});
		});
	}

	close() {
		this.lastFocusedElement.focus();
		this.buttons = [];
		this.clear();
	}
	
	clear() {
		while(this.container.firstChild) {
			this.container.removeChild(this.container.firstChild);
		}
	}
}