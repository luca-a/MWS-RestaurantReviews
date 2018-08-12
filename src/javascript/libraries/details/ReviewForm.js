import CustomElement from "../common/CustomElement";
import Template from "../common/Template";
import { createReview, editReview } from "../common/ReviewService.js";

export default class ReviewForm extends CustomElement {
	constructor(selector, templateSelector) {
		super(selector);

		this.templateSelector = templateSelector;

		this.form = new Template(templateSelector);

		this.adding = false;
	}

	static getFormValues(form) {
		const result = {};

		for(let input of form) {
			switch(input.type) {
				case "checkbox":
				case "radio":
					if(input.checked)
						result[input.name] = input.value;
					break;
				case "text":
				case "textarea":
					result[input.name] = input.value;
					break;
				case "number":
					result[input.name] = parseInt(input.value);
					break;
				default:
			}
		}

		return result;
	}

	static setFormValues(form, data) {
		for(let input of form)
			if(data[input.name])
				switch(input.type) {
					case "checkbox":
					case "radio":
						if(data[input.name] == input.value)
							input.checked = true;
						break;
					case "text":
					case "textarea":
						input.value = data[input.name];
						break;
					default:
				}
	}

	static submit(event, id) {
		if(id)
			return editReview(id, ReviewForm.getFormValues(event.target))
				.then(result => {
					return {
						action: "edit",
						result,
					};
				});
		else
			return createReview(ReviewForm.getFormValues(event.target))
				.then(result => {
					return {
						action: "create",
						result,
					};
				});
	}

	appendForm(data) {
		this.adding = true;

		let id;

		if(data) {
			id = data.id;
			ReviewForm.setFormValues(this.form.element, data);
		}

		this.appendElement(this.form.element);

		this.form.element[0].focus();

		return new Promise(resolve => {
			this.form.element.addEventListener("submit", event => {
				event.preventDefault();

				this.clear();
				this.form.reset();

				this.adding = false;

				resolve(ReviewForm.submit(event, id));
			});
		});
	}
}