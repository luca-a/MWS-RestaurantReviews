import CustomElement from "./CustomElement.js";
import { imagesProperties } from "../configuration/settings.js";

export default class CustomImage extends CustomElement {
	constructor(selector, container) {
		super(selector, container);

		this.location = imagesProperties.location || "/";
		this.extension = imagesProperties.extension || ".jpg";
		this.sources = imagesProperties.sources;
	}

	defaultElements() {
		this.base.fragment = this.base.fragment || document.createDocumentFragment();
		this.base.picture = this.base.picture || document.createElement("picture");
		this.base.source = this.base.source || document.createElement("source");
		this.base.image = this.base.image ||  document.createElement("img");
	}

	getSrcset(srcsets, name) {
		let l = srcsets.length, srcset, attribute = "";

		for(let i = 0; i < l; i++) {
			srcset = srcsets[i];

			attribute += name + srcset.name + this.extension + (typeof srcset.type !== "undefined" ? " " + srcset.type : "") + (i !== l - 1 ? "," : "");
		}

		return attribute;
	}

	applyProperties(element, source, name) {
		for(let key in source) {
			switch(key) {
			case "className":
				element.className = source.className;
				break;
			case "sizes":
				element.sizes = source.sizes;
				break;
			case "srcset":
				element.srcset = this.getSrcset(source.srcset, name);
				break;
			case "src":
				element.src = name + source.src + this.extension;
				break;
			case "media":
				element.media = source.media;
				break;
			default:
			}
		}

		return element;
	}

	appendSources(imageName, alt) {
		const fragment = this.base.fragment.cloneNode(),
			sources = this.sources,
			name = `${this.location}/${imageName}`,
			l = sources.length;

		for(let i = 0; i < l; i++) {
			fragment.appendChild(this.applyProperties(i !== l - 1 ? this.base.source.cloneNode() : this.base.image.cloneNode(), sources[i], name));
		}

		fragment.lastElementChild.alt = alt || "";
	
		this.appendChild(fragment);
	}

	getPicture(imageName) {
		const picture = this.base.picture.cloneNode(),
			sources = this.sources,
			name = `${this.location}/${imageName}`,
			l = sources.length - 1;

		for(let i = 0; i < l; i++) {
			picture.appendChild(this.applyProperties(i !== l - 1 ? this.base.source.cloneNode() : this.base.image.cloneNode(), sources[i], name));
		}
		
		return picture;
	}
}