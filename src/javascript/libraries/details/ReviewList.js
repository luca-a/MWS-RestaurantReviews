import Template from "../common/Template.js";
import CustomElement from "../common/CustomElement.js";
import { reviewsSettings } from "../configuration/settings.js";
import { deleteReview, getReview } from "../common/ReviewService.js"

export default class ReviewList extends CustomElement {
	constructor(selector, templateSelector) {
		super(selector);

		this.template = new Template(templateSelector);

		this.editCallback;
	}

	static toggleReview(e) {
		e.currentTarget.getElementsByClassName("comment-text")[0].classList.toggle("collapsed");
	}

	static pad(string, length, char, before = true) {
		let result = string + "";

		while(result.length < length)
			if(before)
				result = char + result;
			else
				result += char;

		return result;
	}

	defaultElements() {
		this.base.fragment = this.base.fragment || document.createDocumentFragment();
	}

	getRating(rating) {
		let result = "", i, settings = reviewsSettings.rating;

		for(i = 0; i < rating; i++)
			result += settings.star_f;
		
		for(;i < settings.max; i++)
			result += settings.star_o;
		
		return result;
	}

	getDate(created, updated) {
		let result = "";
		const date = new Date(created);

		result += `${this.constructor.pad(date.getDay(), 2, 0)}/${this.constructor.pad(date.getMonth(), 2, 0)}/${date.getFullYear()}`;
		result += " at ";
		result += `${this.constructor.pad(date.getHours(), 2, 0)}:${this.constructor.pad(date.getMinutes(), 2, 0)}`;
		result += created !== updated ? " " + reviewsSettings.edited : "";

		return result;
	}

	extractDataFromReview(id) {
		let review = this.getReviewById(id);
		
		return {
			id,
			name: review.querySelector(".name").textContent,
			rating: review.querySelector(".rating").getAttribute("data-rating-value"),
			comments: review.querySelector(".comment-text").textContent
		};
	}

	controlsClicked(event) {
		if(event.key && event.key !== "Enter") return;

		let id = event.currentTarget.getAttribute("data-review-id");

		let button = event.target;

		if(button.classList.contains("remove")) {
			deleteReview(id).then(() => {
				this.removeReview(id);
			});
		} else {
			this.editCallback(this.extractDataFromReview(id));
		}
	}

	appendReviews(reviews = []) {
		let fragment = this.base.fragment.cloneNode();

		for(let review of reviews) {
			this.template.replace(".name", review.name);
			this.template.replace(".date", this.getDate(review.createdAt, review.updatedAt));
			this.template.replace(".comment-text", review.comments);
			this.template.replace(".rating", this.getRating(review.rating));

			this.template.child(".rating").setAttribute("data-rating-value", review.rating);

			const controls = this.template.child(".controls-container");

			controls.setAttribute("data-review-id", review.id);

			controls.addEventListener("click", event => this.controlsClicked(event));
			controls.addEventListener("keydown", event => this.controlsClicked(event));

			this.template.child(".comment-container").addEventListener("mousedown", this.constructor.toggleReview);

			fragment.append(this.template.element);
			this.template.reset();
		}

		this.appendElement(fragment);
	}

	getReviewById(id) {
		let controls = this.element.querySelector(`.controls-container[data-review-id="${id}"]`);

		while(!((controls = controls.parentElement).classList.contains("review")));

		return controls;
	}

	removeReview(id) {
		let review = this.getReviewById(id);

		review.parentElement.removeChild(review);
	}
}