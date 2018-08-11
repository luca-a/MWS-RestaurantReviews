import worker from "./MainWorker";

export const deleteReview = id => {
	return worker.call("delete", {
		name: "reviews",
		path: `reviews/${id}`
	});
}

export const createReview = body => {
	return worker.call("post-map", {
		name: "reviews",
		path: "reviews/",
		body
	});
};

export const editReview = (id, body) => {
	return worker.call("put-map", {
		name: "reviews",
		path: `reviews/${id}`,
		body
	});
};

export const getRestaurantReviews = restaurant_id => {
	return worker.call("get-map", {
		name: "reviews",
		path: "reviews/?restaurant_id=" + restaurant_id,
		mapping: new Map([
			["id", "unique"],
			["restaurant_id", ""]
		])
	}).then(() => {
		return worker.call("get-mapped", {
			name: "reviews",
			attribute: "restaurant_id",
			key: restaurant_id
		});
	});
};

export const getReview = id => {
	return worker.call("get-mapped", {
		name: "reviews",
		attribute: "id",
		key: id
	}).then();
};