((window, document) => {
	"use strict";

	/* global function declaration */
	window.initMap = () => {
		main.then(() => {
			mapController.initialize({
				zoom: 12,
				center: new google.maps.LatLng(40.722216, -73.987501),
				scrollwheel: false
			});

			updateRestaurants();
		});
	};

	let reader, swController, restaurantsView, filterView, mapController, toastsView, imageGenerator, dbController;

	const updateRestaurants = () => {
		const cuisine = filterView.getValue("cuisines");
		const neighborhood = filterView.getValue("neighborhoods");

		let cuisineRestaurants, neighborhoodRestaurants;

		if(cuisine === "all") {
			cuisineRestaurants = reader.getValue("id");
		} else {
			cuisineRestaurants = reader.getValue("cuisine_type", cuisine);
		}

		if(neighborhood === "all") {
			neighborhoodRestaurants = reader.getValue("id");
		} else {
			neighborhoodRestaurants = reader.getValue("neighborhood", neighborhood);
		}

		let restaurants = reader.intersect("id", cuisineRestaurants, neighborhoodRestaurants);

		restaurantsView.clear();
		mapController.setMarkerMap(null);
		mapController.clearAccessibilityElement();

		let marker;

		for(let restaurant of restaurants) {
			restaurantsView.createResturant(restaurant);

			mapController.addAccessibilityElement(`${restaurant.name} at ${restaurant.address}`);

			marker = mapController.addMarker({
				position: restaurant.latlng,
				title: restaurant.name,
				url: `/restaurant.html?id=${restaurant.id}`,
			});

			(currentMarker => {
				currentMarker.addListener("click",
					() => {
						window.location.href = currentMarker.url;
					}
				);
			})(marker);			
		}
	};

	const properties = new Map();

	properties.set("id", "unique").set("cuisine_type", "").set("neighborhood", "");

	let main = new Promise((resolve, reject) => {
		/* initialization of the data reader */
		reader = new DataReader("http://localhost:1337/restaurants");

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
				return dbController.getList("restaurants");
			}
		});
	}).then(() => {		
		/* toasts view */
		toastsView = new Toasts(document.getElementById("toasts"));

		/* initialization of the service worker controller */
		swController = new ServiceWorkerController("/sw.js", toastsView);
		swController.checkUpdate();

		/* initialization of the Restaurants View */
		restaurantsView = new Restaurants(document.getElementsByClassName("restaurants-list")[0], imageGenerator);

		/* initialization of the filters view */
		let elements = new Map([["cuisines", document.getElementById("cuisines-select")], ["neighborhoods", document.getElementById("neighborhoods-select")]]);

		filterView = new Filters(elements);

		filterView.setChangeCallback("cuisines", updateRestaurants);
		filterView.setChangeCallback("neighborhoods", updateRestaurants);

		/* set the options value */
		filterView.setOptions("cuisines", reader.getKeys("cuisine_type"));
		filterView.setOptions("neighborhoods", reader.getKeys("neighborhood"));

		/* initialization of the map controller */
		mapController = new MapController(document.getElementsByClassName("map")[0], document.getElementsByClassName("accessibility-map")[0]);
		mapController.initializeAccessibility(document.getElementById("neighborhoods-select"), document.getElementById("footer-home"));
	}).catch(error => window.console.error(error));
})(window, window.document);