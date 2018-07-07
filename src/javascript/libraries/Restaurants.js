class Restaurants {
	constructor(container, imageGenerator) {
		this.container = container;
		this.imageGenerator = imageGenerator;
		this.createDefaultElements();
	}

	createDefaultElements() {
		this.defaultLi = document.createElement("li");

		this.defaultH3 = document.createElement("h3");

		this.defaultP = document.createElement("p");

		this.defaultA = document.createElement("a");
		this.defaultA.className = "button";
		this.defaultA.innerHTML = "View Details";
	}

	createResturant(restaurant) {
		const li = this.defaultLi.cloneNode();

		const picture = this.imageGenerator.create(restaurant.photograph || restaurant.id);
		picture.lastChild.alt = `${restaurant.name} restaurant photo`;

		const name = this.defaultH3.cloneNode();
		name.innerHTML = restaurant.name;

		const neighborhood = this.defaultP.cloneNode();
		neighborhood.innerHTML = restaurant.neighborhood;
  
		const address = this.defaultP.cloneNode();
		address.innerHTML = restaurant.address;
  
		const more = this.defaultA.cloneNode(true);
		more.href = `/restaurant.html?id=${restaurant.id}`;
		
		li.appendChild(picture);
		li.appendChild(name);
		li.appendChild(neighborhood);
		li.appendChild(address);
		li.appendChild(more);
		
		this.container.appendChild(li);
	}

	clear() {
		while(this.container.firstChild) {
			this.container.removeChild(this.container.firstChild);
		}
	}
}