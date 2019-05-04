const MONGO_ID = '_id';
const ID = 'id';

function fieldNameToMongo(name) {
  if (name === ID) {
    return MONGO_ID;
  }
  return name;
}

function convertToMongo(value) {
  if (!value || value[ID] === undefined) {
    return value;
  }
  const { [ID]: id, ...rest } = value;
  return { [MONGO_ID]: id, ...rest };
}

function convertFromMongo(value) {
  if (!value || value[MONGO_ID] === undefined) {
    return value;
  }
  const { [MONGO_ID]: id, ...rest } = value;
  return { [ID]: id, ...rest };
}

function makeMongoFields(names) {
  const fields = {};
  if (names) {
    fields[MONGO_ID] = false;
    names.forEach((fieldName) => {
      fields[fieldNameToMongo(fieldName)] = true;
    });
  }
  return fields;
}

export default class MongoCollection {
  constructor(collection, keys = {}) {
    this.collection = collection;

    Object.keys(keys).forEach((keyName) => {
      const options = keys[keyName];
      if (options.unique) {
        collection.createIndex({ [keyName]: 1 }, { unique: true });
      } else {
        collection.createIndex({ [keyName]: 'hashed' });
      }
    });
  }

  async add(value) {
    await this.collection.insertOne(convertToMongo(value));
  }

  async update(keyName, key, value, { upsert = false } = {}) {
    await this.collection.updateOne(
      { [fieldNameToMongo(keyName)]: key },
      { $set: value },
      { upsert },
    );
  }

  async get(keyName, key, fields = null) {
    const raw = await this.collection.findOne(
      { [fieldNameToMongo(keyName)]: key },
      makeMongoFields(fields),
    );
    return convertFromMongo(raw);
  }

  async getAll(keyName, key, fields = null) {
    const result = [];

    const cursor = await this.collection.find(
      { [fieldNameToMongo(keyName)]: key },
      makeMongoFields(fields),
    );
    cursor.forEach((doc) => {
      result.push(doc);
    });

    return result;
  }
}
