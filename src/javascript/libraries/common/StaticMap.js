import CustomElement from "./CustomElement.js";
import { mapsSettings } from "../configuration/settings.js";


export default class StaticMap {
	constructor(selector, properties = {}) {
		this.element = CustomElement.parseElement(selector, properties.container);
		this.loader = CustomElement.parseElement(properties.loader, properties.container);

		this.maxWidth = mapsSettings.static.maxWidth;
		this.maxHeight = mapsSettings.static.maxHeight;
		this.key = mapsSettings.key;
		this.base = mapsSettings.static.url;

		this.setProperties(properties);

		const loader = this.loader;

		this.element.addEventListener("load", () => {
			requestAnimationFrame(() => {
				loader.parentElement.removeChild(loader);
			});
		});
	}

	setProperties(properties) {
		let parent = this.element.parentElement;

		if(properties.center && properties.zoom)
			this.url = this.getStaticMapUrl({
				key: this.key,
				width: parseInt(parent.clientWidth),
				height: parseInt(parent.clientHeight),
				centerLat: properties.center.lat,
				centerLng: properties.center.lng,
				zoom: properties.zoom || 12
			});
	}

	getStaticMapUrl(replaces) {
		let url = this.base;

		for(let key in replaces) {
			url = url.replace(`{{${key}}}`, replaces[key]);
		}

		return url;
	}

	waitFor(event) {
		let tmp;

		return new Promise(resolve => {
			tmp = resolve;
			this.element.addEventListener(event, tmp);
		}).then(() => {
			this.element.removeEventListener(event, tmp);
		});
	}

	load() {
		this.element.src = this.url;
	}
}