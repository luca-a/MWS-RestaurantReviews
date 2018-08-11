import Template from "../common/Template.js";
import CustomImage from "../common/CustomImage.js";
import ReviewList from "./ReviewList.js";
import ReviewForm from "./ReviewForm.js";
import { setFavorite } from "../common/FavoriteService.js";
import { getRestaurantReviews } from "../common/ReviewService.js";
import CustomElement from "../common/CustomElement.js";
import Table from "./Table.js";
import Toast from "../common/Toast";

export default class Restaurant {
	constructor(selector) {
		this.id;

		this.restaurant = new Template(selector);
		this.reviews = new ReviewList(".reviews-list", "#templates-container > .review");

		this.reviews.editCallback = review => this.appendForm(review);

		this.hours = new Table(".hours > thead", this.restaurant.element);
		this.image = new CustomImage(".image-container", this.restaurant.template);

		this.toast = new Toast("#toasts");

		this.toast.set("Add a review", "You have to submit the review you're writing before creating a new one");

		this.reviewForm = new ReviewForm(".new-review-container", "#templates-container > .add-review-form");

		this.addReview = CustomElement.parseElement(".buttons > .add-review");
		this.addReview.addEventListener("click", () => this.appendForm());
	}
	
	appendForm(review) {
		if(this.reviewForm.adding)
			this.toast.show(15);
		else
			this.reviewForm.appendForm(review).then(response => {
				if(response.action === "create")
					this.reviews.appendReviews([response.result]);
				else
					this.loadReviews(this.id);
			});
	}

	clickFavorite(event) {
		if(event.key && event.key !== "Enter") return;

		let star = event.currentTarget,
			final = !(star.getAttribute("aria-checked") === "true");

		setFavorite(star.getAttribute("data-restaurant-id"), final)
			.then(response => {
				star.setAttribute("aria-checked", final);
			});
	}

	setRestaurant(restaurant) {
		this.id = restaurant.id;

		this.restaurant.replace(".name", restaurant.name);
		this.restaurant.replace(".cuisine", restaurant.cuisine_type);
		this.restaurant.replace(".address", restaurant.address);

		this.image.appendSources(restaurant.photograph || restaurant.id, restaurant.name + " photo");

		this.reviewForm.form.child(".restaurant_id").value = restaurant.id;
		this.reviewForm.form.setStart();

		const star = this.restaurant.child(".star-icon");

		star.setAttribute("aria-label", star.getAttribute("aria-label") + restaurant.name);
		star.setAttribute("aria-checked", restaurant.is_favorite);
		star.setAttribute("data-restaurant-id", restaurant.id);

		star.addEventListener("click", event => this.clickFavorite(event));
		star.addEventListener("keydown", event => this.clickFavorite(event));

		if(restaurant.operating_hours)
			this.setHours(restaurant.operating_hours);

		this.loadReviews(this.id);
	}

	loadReviews(id) {
		getRestaurantReviews(id).then(reviews => {
			this.setReviews(reviews);
		})
	}

	setReviews(reviews) {
		this.reviews.clear();
		this.reviews.appendReviews(reviews);
	}

	setHours(hours) {
		this.hours.appendTable(hours);
	}
}