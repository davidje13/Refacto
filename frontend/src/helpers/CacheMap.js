export default class CacheMap {
  constructor(builder) {
    this.data = new Map();
    this.builder = builder;
  }

  get(key) {
    if (this.data.has(key)) {
      return this.data.get(key);
    }
    const value = this.builder(key);
    this.data.set(key, value);
    return value;
  }
}
