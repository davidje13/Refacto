export class CacheMap<K, V> {
  private readonly data = new Map<K, V>();

  public constructor(private readonly builder: (key: K) => V) {}

  public get(key: K): V {
    if (this.data.has(key)) {
      return this.data.get(key)!;
    }
    const value = this.builder(key);
    this.data.set(key, value);
    return value;
  }

  public remove(key: K): void {
    this.data.delete(key);
  }
}
