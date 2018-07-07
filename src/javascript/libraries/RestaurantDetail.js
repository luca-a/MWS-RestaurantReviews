class RestaurantDetail {
	constructor(container, reviewContainer, imageGenerator) {
		this.container = container;

		this.reviewContainer = reviewContainer;

		this.imageGenerator = imageGenerator;
		/*
		this.defaultImageFolder = "img";

		this.imageNames = [
			"692x2",
			"346x1",
			"250x1"
		];
		*/
		this.getElements();
		this.createDefaultElements();
	}

	createDefaultElements() {
		this.defaultTr = document.createElement("tr");
		this.defautlTd = document.createElement("td");

		this.defaultDiv = document.createElement("div");
		this.defaultLi = document.createElement("li");
		this.defaultP = document.createElement("p");
		this.defaultComment = this.defaultP.cloneNode();
		this.defaultComment.className = "comment-text collapsed";
	}

	getElements() {
		this.name = this.container.getElementsByClassName("name")[0];
		this.imageContainer = this.container.getElementsByClassName("image-container")[0];
		this.cuisine = this.container.getElementsByClassName("cuisine")[0];
		this.address = this.container.getElementsByClassName("address")[0];
		this.hours = this.container.getElementsByClassName("hours")[0];

		this.reviewList = this.reviewContainer.getElementsByClassName("reviews-list")[0];
	}

	setResturant(restaurant) {
		this.name.innerHTML = restaurant.name;
		this.cuisine.innerHTML = restaurant.cuisine_type;
		this.address.innerHTML = restaurant.address;
		/*
		let i = 0;

		const photoName = `${this.defaultImageFolder}/${restaurant.photograph || restaurant.id}-`;

		this.source.srcset = `${photoName}${this.imageNames[i++]}.jpg 2x, ${photoName}${this.imageNames[i++]}.jpg`;

		this.image.alt = `${restaurant.name} restaurant photo`;
		this.image.src = `${photoName}${this.imageNames[i++]}.jpg`;
		*/
		this.imageContainer.appendChild(this.imageGenerator.create(restaurant.photograph || restaurant.id));

		this.createHours(restaurant.operating_hours);
		this.createReviews(restaurant.reviews);
	}

	createHours(resturantHours) {
		for(let key in resturantHours) {
			let row = this.defaultTr.cloneNode();
		
			let day = this.defautlTd.cloneNode();
			day.innerHTML = key;
			row.appendChild(day);
		
			let time = this.defautlTd.cloneNode();
			time.innerHTML = resturantHours[key];
			row.appendChild(time);
		
			this.hours.appendChild(row);
		}
	}

	createReviews(reviews) {
		if(!reviews || reviews.length === 0) {
			const empty = this.defaultP.cloneNode();
			empty.style.textAlign = "center";
			empty.innerHTML = "No reviews yet!";

			this.reviewContainer.appendChild(empty);

			return false;
		}

		for(let review of reviews) {
			this.reviewList.appendChild(this.createReview(review));
		}
	}

	createReview(review) {
		const name = this.defaultP.cloneNode();
		name.className = "name";
		name.innerHTML += review.name;
		
		const date = this.defaultP.cloneNode();
		date.className = "date";
		date.innerHTML += review.date;
		
		const rating = this.defaultP.cloneNode();
		rating.className = `rating ${review.rating >= 3 ? "green" : "red"}`;
		rating.innerHTML += `Rating: ${review.rating}`;

		const comments = this.defaultComment.cloneNode();
		comments.innerHTML += review.comments;

		const li = this.defaultLi.cloneNode(), reviewContainer = this.defaultDiv.cloneNode(), container = this.defaultDiv.cloneNode(), header = this.defaultDiv.cloneNode();

		header.className = "header";
		header.appendChild(name);
		header.appendChild(date);

		container.className = "review-container";
		reviewContainer.className = "comment-container";

		reviewContainer.appendChild(comments);

		li.addEventListener("mousedown", this.toggleReview);

		container.appendChild(header);
		container.appendChild(rating);
		container.appendChild(reviewContainer);

		li.appendChild(container);

		return li;
	}

	toggleReview(e) {
		e.currentTarget.getElementsByClassName("comment-text")[0].classList.toggle("collapsed");
	}
}