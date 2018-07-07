class Image {
	constructor(location, extension, properties) {
		this.location = location;
		this.defaultExtension = extension;
		this.properties = properties;

		this.createDefaultElements();
	}

	createDefaultElements() {
		this.defaultPicture = document.createElement("picture");

		this.defaultSource = document.createElement("source");

		this.defaultImage = document.createElement("img");
	}

	applySrcset(name, element, srcsets) {
		let i, l = srcsets.length - 1, srcset;

		for(i = 0; i < l; i++) {
			srcset = srcsets[i];

			element.srcset += `${name}${srcset.name}${this.defaultExtension}${typeof srcset.type !== "undefined" ? " " + srcset.type : ""},`;
		}

		srcset = srcsets[i];

		element.srcset += `${name}${srcset.name}${this.defaultExtension}${typeof srcset.type !== "undefined" ? " " + srcset.type : ""}`;

		return element;
	}

	applyProperties(name, element, source) {
		for(let key in source) {
			switch(key) {
			case "className":
				element.className = source.className;
				break;
			case "sizes":
				element.sizes = source.sizes;
				break;
			case "srcset":
				element = this.applySrcset(name, element, source.srcset);
				break;
			case "src":
				element.src = `${name}${source.src}${this.defaultExtension}`;
				break;
			case "media":
				element.media = source.media;
				break;
			default:
			}
		}

		return element;
	}

	create(basename) {
		const sources = this.properties.sources;

		const picture = this.defaultPicture.cloneNode();
		const photoName = `${this.location}/${basename}`;

		let i = 0;
		const l = sources.length - 1;

		for(i; i < l; i++) {
			picture.appendChild(this.applyProperties(photoName, this.defaultSource.cloneNode(), sources[i]));
		}
	
		picture.appendChild(this.applyProperties(photoName, this.defaultImage.cloneNode(), sources[i]));

		return picture;
	}
}