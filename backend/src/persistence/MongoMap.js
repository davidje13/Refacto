export default class MongoMap {
  constructor(collection) {
    this.collection = collection;
  }

  set(key, value) {
    return this.collection.replaceOne(
      { _id: key },
      { v: value },
      { upsert: true },
    );
  }

  async get(key) {
    const raw = await this.collection.findOne(
      { _id: key },
      { _id: false, v: true },
    );

    if (!raw) {
      return null;
    }
    return raw.v;
  }
}
