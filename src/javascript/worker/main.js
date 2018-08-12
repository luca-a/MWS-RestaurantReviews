self.importScripts("DataReader.js", "DatabaseController.js", "CustomService.js", "idb.js");

const functions = new Map(),
	service = new CustomService(),
	readers = new Map(),
	databases = new Map();

const respond = (id, result) => {
	self.postMessage({ id, result });
};

functions.set("url", data => {
	service.url = data;

	return true;
});

functions.set("get-map", data => {
	const name = data.name, mapping = data.mapping,
		reader = readers.get(name) || new DataReader(),
		database = databases.get(name) || new DatabaseController(idb, name, name);

	let fetcher = service
		.get(data.path)
		.then(response => {
			return response.json();
		});

	return reader.store({
		mapping,
		fetcher
	}).then(() => {
		database.add(name, reader.getValue("id"));
	}).catch(() => {
		return reader.store({
			mapping,
			fetcher() {
				return database.getList(name);
			}
		});
	}).then(() => {
		readers.set(name, reader);
		databases.set(name, database);

		return true;
	});
});

functions.set("put-map", data => {
	let status;

	const name = data.name, reader = readers.get(name),
		database = databases.get(name),
		fetcher = service.put(data.path, data.body)
			.then(response => {
				status = response.status;

				return response.json();
			});

	return reader.store({
		fetcher
	}).then(() => {
		database.add(name, reader.getValue("id"));
	}).then(() => {
		readers.set(name, reader);
		databases.set(name, database);

		return status;
	});
});

functions.set("post-map", data => {
	let newObject;

	const name = data.name, reader = readers.get(name),
		database = databases.get(name),
		fetcher = service.post(data.path, data.body)
			.then(response => {
				return response.json();
			}).then(json => {
				newObject = {...json, ...(data.body)};

				return newObject;
			});
	
	return reader.store({
		fetcher
	}).catch(error => {
		const dbName = "temp_" + name;
		const tempDatabase = databases.get(dbName) || new DatabaseController(idb, dbName, dbName);

		return tempDatabase.keys(dbName).then(keys => {
			data.body.id = keys[keys.length - 1] + 1 || 0;

			return tempDatabase.add(dbName, data.body);
		}).then(() => {
			newObject = data.body;

			databases.set(dbName, tempDatabase);
		});
	}).then(() => {
		readers.set(name, reader);
		databases.set(name, database);

		return newObject;
	});
});

functions.set("database-map", data => {
	const name = data.name, mapping = data.mapping,
		reader = readers.get(name) || new DataReader(),
		database = databases.get(name) || new DatabaseController(idb, name, name);

	return reader.store({
		mapping,
		fetcher() {
			return database.getList(name);
		},
		clear: true
	}).then(() => {
		readers.set(name, reader);
		databases.set(name, database);
	});
});

functions.set("get-mapped-keys", data => {
	if(readers.get(data.name))
		return readers.get(data.name).getKeys(data.attribute);
});

functions.set("get-mapped", data => {
	if(readers.get(data.name))
		return readers.get(data.name).getValue(data.attribute, data.key);
});

functions.set("intersect", data => {
	return DataReader.intersect(data.listFirst, data.listSecond, data.key);
});

functions.set("get-mapped-intersect", data => {
	const reader = readers.get(data.name),
		key = data.key,
		list = data.list,
		l = list.length;

	let result = DataReader.intersect(
		reader.getValue(list[0].attribute, list[0].key),
		reader.getValue(list[1].attribute, list[1].key),
		key
	);

	for (let i = 2; i < l; i++) {
		result = DataReader.intersect(
			result,
			reader.getValue(list[i].attribute, list[i].key),
			key
		);
	}

	return result;
});

functions.set("post", data => {
	return service.post(data.path, data.body)
		.then(response => {
			return response.status;
		});
});

functions.set("put", data => {
	return service.put(data.path, data.body)
		.then(response => {
			return response.status;
		});
});

functions.set("delete", data => {
	return service.delete(data.path)
		.then(response => {
			return response.status;
		});
});

self.addEventListener("message", event => {
	let data = event.data;

	let response = functions.get(data.fn)(data.arguments);

	if (response instanceof Promise)
		response.then(result => respond(data.id, result));
	else
		respond(data.id, response);
});