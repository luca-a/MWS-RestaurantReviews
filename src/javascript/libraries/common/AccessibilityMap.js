import AccessibilityList from "./AccessibilityList.js";
import CustomMap from "./CustomMap.js";

export default class AccessibilityMap {
	constructor() {
		this.element = new CustomMap(".map", {
			zoom: 12,
			center: {
				lat: 40.722216,
				lng: -73.987501
			},
			scrollwheel: false
		});
		
		this.accessibility = new AccessibilityList(".accessibility-map");
	}

	addAddress(text) {
		this.accessibility.add(text);
	}

	addMarker(options) {
		return this.element.addMarker(options);
	}

	clear() {
		this.element.clear();
		this.accessibility.clear();
	}
}