import AccessibilityMap from "./common/AccessibilityMap.js";
import worker from "./common/MainWorker.js";
import ServiceWorkerController from "./common/ServiceWorkerController.js";

((window) => {
	"use strict";

	const regex = new RegExp("[?&]id=([0-9]+)", "g").exec(window.location.search),
		id = regex ? parseInt(regex[1]) : null, promises = [];

	let map, serviceWorker;
	
	const load = new Promise(resolve => {
		document.addEventListener("DOMContentLoaded", resolve);
	}).then(() => {		
		map = new AccessibilityMap();

		serviceWorker = new ServiceWorkerController("/sw.js");
		serviceWorker.checkUpdate();
	});

	import("../../sass/main.sass");

	if(id === null) {
		promises.push(import("./list/Filters.js"));
		promises.push(import("./list/RestaurantsMap.js"));
		import("../../sass/list.sass");
	} else {
		promises.push(import("./details/Breadcrumb.js"));
		promises.push(import("./details/Restaurant.js"));
		import("../../sass/details.sass");
	}

	promises.push(load);

	const main = Promise.all(promises);

	const mapRestaurants = worker.call("get-map", {
		name: "restaurants",
		path: "restaurants/",
		mapping: new Map([
			["id", "unique"],
			["cuisine_type", ""],
			["neighborhood", ""]
		])
	});

	if(id === null) {
		let restaurants, filters;

		const update = () => {
			const cuisines = filters.getValue("cuisines"),
				neighborhoods = filters.getValue("neighborhoods"), list = [];

			if(cuisines === "all")
				list.push({ attribute: "id" });
			else
				list.push({	attribute: "cuisine_type", key: cuisines });

			if(neighborhoods === "all")
				list.push({ attribute: "id" });
			else
				list.push({ attribute: "neighborhood", key: neighborhoods });

			worker.call("get-mapped-intersect", {
				name: "restaurants",
				key: "id",
				list
			}).then(restaurantsJson => {
				restaurants.appendRestaurants(restaurantsJson);
			});
		};

		main.then(([Filters, RestaurantsMap]) => {
			restaurants = new RestaurantsMap.default({
				map,
				prefix: "/restaurant.html?id="
			});

			filters = new Filters.default({
				cuisines: "#cuisines-select",
				neighborhoods: "#neighborhoods-select"
			});

			return mapRestaurants;
		}).then(() => {
			return worker.call("get-mapped-keys", {
				name: "restaurants",
				attribute: "cuisine_type"
			});
		}).then(response => {
			filters.setOptions("cuisines", response);

			return worker.call("get-mapped-keys", {
				name: "restaurants",
				attribute: "neighborhood"
			});
		}).then(response => {
			filters.setOptions("neighborhoods", response);

			filters.change("cuisines", update);
			filters.change("neighborhoods", update);

			update();
		});
	} else {
		let breadcrumb, restaurant;

		main.then(([Breadcrumb, Restaurant]) => {	
			breadcrumb = new Breadcrumb.default("#breadcrumb");

			restaurant = new Restaurant.default("#restaurant-wrapper");

			return mapRestaurants;
		}).then(() => {
			return worker.call("get-mapped", {
				name: "restaurants",
				attribute: "id",
				key: id
			});
		}).then(restaurantJson => {
			breadcrumb.addElement(restaurantJson.name);

			restaurant.setRestaurant(restaurantJson);

			map.addAddress(`${restaurantJson.name} at ${restaurantJson.address}`);
			map.element.setCenter(restaurantJson.latlng);
			map.addMarker({
				position: restaurantJson.latlng,
				title: restaurantJson.name
			});
		});
	}

	main.then(() => {
		return Promise.all([
			import("../../sass/media.sass"),
			import("../../sass/font-face.css")
		]);
	}).then(() => {
		setTimeout(() => {
			map.element.initialize();
		}, 1000);
	});
})(window);