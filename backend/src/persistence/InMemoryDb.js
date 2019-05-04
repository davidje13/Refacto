import InMemoryCollection from './InMemoryCollection';

export default class InMemoryDb {
  constructor(simulatedDelay = 0) {
    this.simulatedDelay = simulatedDelay;
    this.mapTables = new Map();
  }

  getCollection(name, keys) {
    if (!this.mapTables.has(name)) {
      this.mapTables.set(name, new InMemoryCollection(
        keys,
        this.simulatedDelay,
      ));
    }
    return this.mapTables.get(name);
  }
}
