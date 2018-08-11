import Template from "./Template.js";
import CustomElement from "./CustomElement.js";

export default class Toast extends CustomElement {
	constructor(selector, properties = {}) {
		super(selector);
		
		this.lastActive;
		this.template = new Template("#templates-container > .toast");
		this.template.reset();
		this.buttons = [];

		if(properties.label && properties.text && properties.buttons)
			this.set(properties.label, properties.text, properties.buttons);
	}

	pressed(event, resolve) {
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
			resolve();
			this.close();
		}
	}

	clicked(event, resolve) {
		if(event.target.nodeName === "BUTTON") {
			resolve(event.target.innerHTML);
			this.close();
		}
	}

	defaultElements() {
		this.base.fragment = this.base.fragment || document.createDocumentFragment();
		this.base.button = this.base.button || document.createElement("button");
	}

	set(label, text, labels = []) {
		let buttonContainer = this.template.child(".buttons"),
			id = label.replace("\\s/g", "_"),
			fragment = this.base.fragment.cloneNode(),
			button;

		this.buttons.length = 0;

		this.template.replace(".toast-content", text);

		for(const label of labels) {
			button = this.base.button.cloneNode();

			button.textContent = label;

			this.buttons.push(button);

			fragment.appendChild(button);
		}

		this.appendElement(fragment, buttonContainer);

		this.template.element.setAttribute("aria-label", label);
		this.template.element.setAttribute("aria-describedby", id);

		return this;
	}

	show(timeout = 10) {
		let element = this.template.element, pressed, clicked;

		this.lastActive = document.activeElement;

		this.appendElement(element);

		if(this.buttons.length > 0) {
			this.buttons[0].focus();

			return new Promise(resolve => {
				pressed = event => this.pressed(event, resolve);
				clicked = event => this.clicked(event, resolve);

				element.addEventListener("keydown", pressed);
				element.addEventListener("click", clicked);
			}).then(value => {
				element.removeEventListener("keydown", pressed);
				element.removeEventListener("click", clicked);
			
				return value;
			});
		} else {
			return new Promise(resolve => {
				setTimeout(resolve, timeout * 1000);
			}).then(() => {
				this.close();
			});
		}
	}

	close() {
		this.lastActive.focus();
		this.element.removeChild(this.template.element);
	}
}