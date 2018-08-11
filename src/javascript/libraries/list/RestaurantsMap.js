import RestaurantsList from "./RestaurantsList.js";

export default class RestaurantsMap {
	constructor(options) {
		this.map = options.map;
		this.list = new RestaurantsList(".restaurants-list");
		this.linkPrefix = options.prefix;
	}

	appendRestaurants(restaurants) {
		this.list.clear();
		this.map.clear();

		for(let restaurant of restaurants) {
			this.list.appendRestaurant(restaurant);
			this.map.addAddress(`${restaurant.name} at ${restaurant.address}`);

			this.map.addMarker({
				position: restaurant.latlng,
				title: restaurant.name,
				url: this.linkPrefix + restaurant.id,
				listeners: {
					click: () => window.location.href = marker.url
				}
			});
		}
	}
}