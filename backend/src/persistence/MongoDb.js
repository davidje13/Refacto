import MongoCollection from './MongoCollection';

export default class MongoDb {
  static async connect(url) {
    const { MongoClient } = await import('mongodb');
    const client = await MongoClient.connect(url, {
      poolSize: 20,
      useNewUrlParser: true,
    });
    return new MongoDb(client.db());
  }

  constructor(db) {
    this.db = db;
  }

  getCollection(name, keys) {
    const collection = this.db.collection(name);
    return new MongoCollection(collection, keys);
  }
}
