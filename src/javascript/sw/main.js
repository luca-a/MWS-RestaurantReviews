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

	switch(request.method) {
		case "GET":
			let requestUrl = new URL(request.url);

			if(requestUrl.origin === location.origin) {
				if(requestUrl.pathname.includes(".jpg")) {
					event.respondWith(serveImage(request));
					return;
				}
		
				if(requestUrl.pathname.includes(".html")) {
					event.respondWith(servePage(request));
					return;
				}
		
				if(requestUrl.pathname.includes(".js") || requestUrl.pathname.includes(".css")) {
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
			console.log(request);
	}
});

self.addEventListener("sync", function(event) {
	if(event.tag == "sync-actions") {
		event.waitUntil(syncOfflineActions());
	}
});

self.addEventListener("message", event => {
	if(event.data === "refresh") {
		self.skipWaiting();
	}
});