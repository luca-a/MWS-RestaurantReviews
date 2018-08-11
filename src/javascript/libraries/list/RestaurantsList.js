import Template from "../common/Template.js";
import CustomElement from "../common/CustomElement.js";
import { setFavorite } from "../common/FavoriteService.js";
import CustomImage from "../common/CustomImage.js";

export default class RestaurantsList extends CustomElement {
	constructor(selector) {
		super(selector);

		this.restaurant = new Template("#templates-container > .restaurant");

		this.image = new CustomImage(".image", this.restaurant.element);
	}

	clickFavorite(event) {
		if(event.key && event.key !== "Enter") return;

		let star = event.currentTarget,
			final = !(star.getAttribute("aria-checked") === "true");

		setFavorite(star.getAttribute("data-restaurant-id"), final)
			.then((response) => {
				star.setAttribute("aria-checked", final);
			});
	}

	appendRestaurant(restaurant) {
		this.restaurant.replace(".name", restaurant.name);
		this.restaurant.replace(".location", restaurant.neighborhood);
		this.restaurant.replace(".address", restaurant.address);
		this.restaurant.child(".button").href = `/restaurant.html?id=${restaurant.id}`;

		this.image.setElement(this.restaurant.child(".image-container"));
		this.image.appendSources(restaurant.photograph || restaurant.id);

		const star = this.restaurant.child(".star-icon");

		star.setAttribute("aria-label", star.getAttribute("aria-label") + restaurant.name);
		star.setAttribute("aria-checked", restaurant.is_favorite);
		star.setAttribute("data-restaurant-id", restaurant.id);

		star.addEventListener("click", (event) => this.clickFavorite(event));
		star.addEventListener("keydown", (event) => this.clickFavorite(event));
		
		this.appendElement(this.restaurant.element);
		this.restaurant.reset();
	}

	appendResturants(restaurants) {
		for(let restaurant of restaurants) {
			appendResturant(restaurant);
		}
	}
}