export const focusable = "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])";

export const mapsSettings = {
	key: "AIzaSyAg9khx_6fMHhttV_jSIv6vbEiEpWBptSc",
	static: {
		url: "https://maps.googleapis.com/maps/api/staticmap?center={{centerLat}},{{centerLng}}&zoom={{zoom}}&size={{width}}x{{height}}&maptype=roadmap&key={{key}}&scale=2"
	}
};

export const reviewsSettings = {
	edited: "🖉",
	rating: {
		star_f: "★",
		star_o: "☆",
		max: 5
	}
};

export const imagesProperties = {
	location: "img/restaurants",
	extension: ".jpg",
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
};

export const workerSettings = {
	file: "js/worker/main.js",
	url: "http://localhost:1337/"
};