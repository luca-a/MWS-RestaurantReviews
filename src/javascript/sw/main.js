const staticCacheName = "restaurant-reviews-v1",
	imageCache = "restaurant-reviews-images-v1";

var allCaches = [
	staticCacheName,
	imageCache
];

const resources = [
	"/",
	"/restaurant.html"
];

const syncOfflineActions = () => {
	if (typeof DatabaseController === "undefined" && typeof idb === "undefined")
		importScripts("js/worker/idb.js", "js/worker/DatabaseController.js");

	const tempDBname = "temp_reviews", tempDb = new DatabaseController(idb, tempDBname, tempDBname),
		DBname = "reviews", db = new DatabaseController(idb, DBname, DBname);

	return tempDb.getList(tempDBname).then(list => {
		const fetches = new Array(list.lenght);
		let id;

		for (let row of list) {
			id = row.id;
			delete row.id;

			fetches.push(
				fetch("http://localhost:1337/reviews/", {
					method: "POST",
					body: JSON.stringify(row)
				}).then(response => {
					return response.json();
				}).then(json => {
					let review = {...json, ...row};

					return db.add(DBname, review);
				}).then(() => {
					return tempDb.delete(tempDBname, id);
				})
			);
		}

		return Promise.all(fetches);
	});
};

const servePage = request => {
	const regex = /\/.*?\.html/g,
		storageIndex = regex.exec(request.url)[0];

	return caches.open(staticCacheName).then(cache => {
		return cache.match(storageIndex).then(cacheResponse => {
			return cacheResponse || fetch(request).then(response => {
				cache.put(storageIndex, response.clone());

				return response;
			});
		});
	});
};

const serveImage = request => {
	var storageIndex = request.url.replace(/-.+\.jpg$/, "");

	return caches.open(imageCache).then(cache => {
		return cache.match(storageIndex).then(cacheResponse => {
			return cacheResponse || fetch(request).then(response => {
				cache.put(storageIndex, response.clone());

				return response;
			});
		});
	});
};

const serve = request => {
	return caches.open(staticCacheName).then(cache => {
		return cache.match(request).then(cacheResponse => {
			return cacheResponse || fetch(request).then(response => {
				cache.put(request, response.clone());

				return response;
			});
		});
	});
};

self.addEventListener("install", event => {
	event.waitUntil(
		caches.open(staticCacheName).then(cache => {
			return cache.addAll(resources);
		}).catch(error => {
			self.console.log(error);
		})
	);
});

self.addEventListener("activate", event => {
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.filter(cacheName => {
					return cacheName.startsWith("restaurant-reviews-") && !allCaches.includes(cacheName);
				}).map(cacheName => {
					return caches.delete(cacheName);
				})
			);
		}).catch(error => {
			self.console.log(error);
		})
	);
});

self.addEventListener("fetch", event => {
	let request = event.request.clone();

	switch (request.method) {
		case "GET":
			let requestUrl = new URL(request.url);

			if (requestUrl.origin === location.origin) {
				if (requestUrl.pathname.includes(".jpg")) {
					event.respondWith(serveImage(request));
					return;
				}

				if (requestUrl.pathname.includes(".html")) {
					event.respondWith(servePage(request));
					return;
				}

				if (requestUrl.pathname.includes(".js") || requestUrl.pathname.includes(".css")) {
					event.respondWith(serve(request));
					return;
				}
			}

			event.respondWith(
				caches.match(request).then(response => {
					return response || fetch(request);
				}).catch(error => {
					return new Response("Offline");
				})
			);
			break;
		case "POST":
		case "PUT":
		case "DELETE":
	}
});

self.addEventListener("sync", event => {
	if (event.tag == "sync-actions") {
		event.waitUntil(syncOfflineActions());
	}
});

self.addEventListener("message", event => {
	if (event.data === "refresh") {
		self.skipWaiting();
	}
});