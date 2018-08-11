import worker from "./MainWorker";

export const setFavorite = (restaurantId, value) => {
	return worker.call("put-map", {
		name: "restaurants",
		path: `restaurants/${restaurantId}/?is_favorite=${value}`
	});
};