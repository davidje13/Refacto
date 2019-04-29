import InMemoryMap from './InMemoryMap';

export default class InMemoryDb {
  constructor(simulatedDelay = 0) {
    this.simulatedDelay = simulatedDelay;
    this.mapTables = new Map();
  }

  getMap(name) {
    if (!this.mapTables.has(name)) {
      this.mapTables.set(name, new InMemoryMap(this.simulatedDelay));
    }
    return this.mapTables.get(name);
  }
}
