class DatabaseController {
	constructor(idb, dbname, name) {
		this.dbPromise = idb.open(dbname, 1, upgradeDb => {
			let store;
	
			switch(upgradeDb.oldVersion) {
			case 0:
				store = upgradeDb.createObjectStore(name, { keyPath: "id" });
			}
		});
	}

	add(name, object) {
		this.dbPromise.then(db => {
			if(!db) return;

			const tx = db.transaction(name, "readwrite");
			const store = tx.objectStore(name);
			
			object = typeof object[Symbol.iterator] === "function" ? object : [object];

			object.forEach(element => {
				store.put(element);
			});
		});
	}

	getList(name) {
		return this.dbPromise.then(db => {
			if(!db) return;

			return db.transaction(name).objectStore(name).getAll();	
		});
	}

	get(name, id) {
		return this.dbPromise.then(db => {
			if(!db) return;

			return db.transaction(name).objectStore(name).get(id);	
		});
	}
}