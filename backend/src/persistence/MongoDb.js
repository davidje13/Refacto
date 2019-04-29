import { MongoClient } from 'mongodb';
import MongoMap from './MongoMap';

export default class MongoDb {
  static async connect({ url }) {
    const client = await MongoClient.connect(url, {
      poolSize: 20,
      useNewUrlParser: true,
    });
    return new MongoDb(client.db());
  }

  constructor(db) {
    this.db = db;
  }

  getMap(name) {
    const collection = this.db.collection(name);
    return new MongoMap(collection);
  }
}
