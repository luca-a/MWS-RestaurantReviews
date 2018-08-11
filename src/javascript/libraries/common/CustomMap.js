import CustomElement from "./CustomElement.js";
import StaticMap from "./StaticMap.js";
import { mapsSettings, focusable } from "../configuration/settings.js";
import loadGoogleMapsApi from "load-google-maps-api";

export default class CustomMap {
	constructor(selector, options) {
		this.element = CustomElement.parseElement(selector);
		this.markers = [];
		this.maps = {};
		this.instance = null;
		this.animation = null;
		this.options = options || {};
		this.key = mapsSettings.key;

		this.static = new StaticMap("#static_map", {
			container: this.element,
			loader: ".loader-container"
		});
	}

	static removeFromTaborder(elements) {
		if(typeof elements[Symbol.iterator] !== "undefined")
			for(let element of elements)
				element.setAttribute("tabindex", -1);
		else
			elements.setAttribute("tabindex", -1);
	}

	accessibility() {
		setTimeout(() => {
			const iframe = this.element.getElementsByTagName("iframe")[0],
				iframeDocument = iframe.contentDocument || iframe.contentWindow.document,
				remove = this.constructor.removeFromTaborder;
			
			iframe.title = "Map section";

			remove(iframe);
			remove(this.element.querySelectorAll(focusable));
			remove(iframeDocument.querySelectorAll(focusable));	
		}, 500);
	}

	initializeStatic() {
		this.static.setProperties({
			center: this.options.center,
			zoom: this.options.zoom
		});

		this.static.load();

		this.promise = this.static.waitFor("click").then(() => {
			return loadGoogleMapsApi({
				key: this.key
			});
		}).then(() => this.initialize());
	}

	initialize() {
		this.promise = loadGoogleMapsApi({
			key: this.key
		}).then((maps) => {
			this.maps = maps;

			this.instance = new maps.Map(this.element, this.options);
	
			this.animation = maps.Animation.DROP;
		
			maps.event.addListenerOnce(this.instance, "tilesloaded", () => this.accessibility());
	
			this.markers = this.markers.map(marker => {
				if(marker.map !== null) return marker;
	
				return this.addMarker(marker);
			}, this);
		});
	}

	setCenter(latLng) {
		if(this.promise)
			this.promise.then(() => {
				this.instance.setCenter(latLng);
			});
		else
			this.options.center = latLng;
	}

	addMarker(options) {
		options.map = this.instance;
		options.animation = options.animation || this.animation;

		const listeners = options.listeners;
		options.listeners = undefined;
		
		let marker;

		if(this.promise) {
			marker = new this.maps.Marker(options);

			for(let listener in listeners)
				marker.addListener(listener, listeners[listener]);
		} else
			marker = options;

		this.markers.push(marker);
		
		return marker;
	}

	setMarkerMap(map) {
		if(this.promise)
			for(let marker of this.markers)
				marker.setMap(map);


		if(map === null)
			this.markers.length = 0;
	}

	clear() {
		this.setMarkerMap(null);
	}
}