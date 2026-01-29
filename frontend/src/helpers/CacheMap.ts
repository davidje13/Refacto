export class CacheMap<K, V> {
  private readonly data = new Map<K, V>();

  constructor(private readonly builder: (key: K) => V) {}

  get(key: K): V {
    if (this.data.has(key)) {
      return this.data.get(key)!;
    }
    const value = this.builder(key);
    this.data.set(key, value);
    return value;
  }

  remove(key: K) {
    this.data.delete(key);
  }
}
