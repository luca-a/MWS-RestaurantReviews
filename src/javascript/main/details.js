((window, document) => {
	"use strict";

	/* global function declaration */
	window.initMap = () => {
		main.then(() => {
			mapController.initialize({
				zoom: 12,
				center: restaurant.latlng,
				scrollwheel: false
			});

			updateRestaurant();
		});
	};

	let reader, swController, mapController, toastsView, restaurant, restaurantDetail, breadcrumb, id, imageGenerator, dbController;
	const regex = new RegExp("[?&]id=([0-9]+)", "g"), properties = new Map();

	const updateRestaurant = () => {
		breadcrumb.addElement(restaurant.name);

		restaurantDetail.setResturant(restaurant);

		mapController.addAccessibilityElement(`${restaurant.name} at ${restaurant.address}`);

		mapController.addMarker({
			position: restaurant.latlng,
			title: restaurant.name
		});
	};

	let main = new Promise((resolve, reject) => {
		imageGenerator = new Image("img/restaurants", ".jpg",
			{
				sources: [
					{
						media: "(min-width: 360px)",
						sizes: "(min-width: 460px) 346px, 100vw",
						srcset: [
							{
								name: "-692x2",
								type: "2x"
							},
							{
								name: "-346x1",
								type: "1x"
							}
						]
					},
					{
						src: "-250x1",
						className: "image"
					}
				]
			}
		);

		/* initialization of the data reader */
		properties.set("id", "unique");

		id = parseInt(regex.exec(window.location.search)[1]);

		reader = new DataReader("http://localhost:1337/restaurants/" + id);

		document.addEventListener("DOMContentLoaded", resolve);
	}).then(() => {
		/* database controller */
		dbController = new DatabaseController(idb, "restaurant-reviews", "restaurants");

		return reader.store({ mapping: properties });
	}).then(() => {
		dbController.add("restaurants", reader.getValue("id"));
	}).catch(() => {
		return reader.store({
			mapping: properties,
			fetcher: () => {
				return dbController.get("restaurants", id);
			}
		});
	}).then(() => {
		/* toasts view */
		toastsView = new Toasts(document.getElementById("toasts"));

		/* initialization of the service worker controller */
		swController = new ServiceWorkerController("/sw.js", toastsView);
		swController.checkUpdate();

		/* restaurant detail view initialization */
		restaurantDetail = new RestaurantDetail(document.getElementById("restaurant-wrapper"), document.getElementById("reviews-container"), imageGenerator);

		/* breadcrumb view initialization */
		breadcrumb = new Breadcrumb(document.getElementById("breadcrumb"));

		/* initialization of the map controller */
		mapController = new MapController(document.getElementsByClassName("map")[0], document.getElementById("accessibility-map"));
		mapController.initializeAccessibility(document.getElementById("footer-home"), document.getElementsByClassName("breadcrumb-home")[0]);
		
		/* gets the restaurnat detail */
		restaurant = reader.getValue("id", id);

		return true;
	}).catch(error => window.console.error(error));
})(window, window.document);