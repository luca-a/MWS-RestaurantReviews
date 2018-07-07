class MapController {
	constructor(element, accessibilityContainer) {
		this.mapElement = element;
		this.map;
		this.markers = [];
		this.accessibilityContainer = accessibilityContainer;
	}

	initialize(options) {
		this.map = new google.maps.Map(this.mapElement, options);

		this.defaultAnimation = google.maps.Animation.DROP;
	}

	initializeAccessibility(nextElement, previousElement) {
		this.nextElement = nextElement;

		this.previousElement = previousElement;

		this.defaultLi = document.createElement("li");

		let mapContainer = this.mapElement.parentNode,
			focusSkipBefore = document.createElement("a");

		focusSkipBefore.tabIndex = "0";
		focusSkipBefore.className = "screen-reader-only";
		focusSkipBefore.innerHTML = "Skip map";

		let focusSkipAfter = focusSkipBefore.cloneNode(true);

		focusSkipBefore.addEventListener("focus", event => {
			this.nextElement.focus();
		});

		focusSkipAfter.addEventListener("focus", event => {
			this.previousElement.focus();
		});
		
		mapContainer.insertBefore(focusSkipBefore, mapContainer.firstChild);
		mapContainer.appendChild(focusSkipAfter);
	}

	addAccessibilityElement(text) {
		let li = this.defaultLi.cloneNode();
		li.innerHTML = text;

		this.accessibilityContainer.appendChild(li);
	}

	clearAccessibilityElement() {
		while(this.accessibilityContainer.firstChild) {
			this.accessibilityContainer.removeChild(this.accessibilityContainer.firstChild);
		}
	}

	addMarker(options) {
		options.map = this.map;
		options.animation = options.animation || this.defaultAnimation;

		const marker = new google.maps.Marker(options);

		this.markers.push(marker);
		
		return marker;
	}

	setMarkerMap(map) {
		for(let marker of this.markers) {
			marker.setMap(map);
		}

		if(map === null) {
			this.markers.length = 0;
		}
	}
}