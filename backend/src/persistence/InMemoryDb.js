import { URL } from 'url';
import InMemoryCollection from './InMemoryCollection';

export default class InMemoryDb {
  static connect(url = 'memory://') {
    const params = new URL(url).searchParams;
    const simulatedLatency = Number(params.get('simulatedLatency'));
    return new InMemoryDb({ simulatedLatency });
  }

  constructor({ simulatedLatency = 0 } = {}) {
    this.simulatedLatency = simulatedLatency;
    this.mapTables = new Map();
  }

  getCollection(name, keys) {
    if (!this.mapTables.has(name)) {
      this.mapTables.set(name, new InMemoryCollection(
        keys,
        this.simulatedLatency,
      ));
    }
    return this.mapTables.get(name);
  }
}
