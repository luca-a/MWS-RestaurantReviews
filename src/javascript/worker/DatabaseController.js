class DatabaseController {
	constructor(idb, dbname, name) {
		this.dbPromise = idb.open(dbname, 1, upgradeDb => {
			let store;

			switch (upgradeDb.oldVersion) {
				case 0:
					store = upgradeDb.createObjectStore(name, { keyPath: "id" });
			}
		});
	}

	/* from idb docs https://github.com/jakearchibald/idb */
	keys(name) {
		return this.dbPromise.then(db => {
			const tx = db.transaction(name);
			const keys = [];
			const store = tx.objectStore(name);

			(store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
				if (!cursor) return;
				keys.push(cursor.key);
				cursor.continue();
			});

			return tx.complete.then(() => keys);
		});
	}

	/* from idb docs https://github.com/jakearchibald/idb */
	delete(name, key) {
		return this.dbPromise.then(db => {
			const tx = db.transaction(name, 'readwrite');
			tx.objectStore(name).delete(key);
			return tx.complete;
		});
	}

	add(name, object) {
		return this.dbPromise.then(db => {
			if (!db) return;

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
			if (!db) return;

			return db.transaction(name).objectStore(name).getAll();
		});
	}

	get(name, id) {
		return this.dbPromise.then(db => {
			if (!db) return;

			return db.transaction(name).objectStore(name).get(id);
		});
	}
}