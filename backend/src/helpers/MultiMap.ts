export class MultiMap<K, V> {
  private readonly _data = new Map<K, Set<V>>();

  add(k: K, v: V) {
    let l = this._data.get(k);
    if (!l) {
      l = new Set();
      this._data.set(k, l);
    }
    l.add(v);
  }

  remove(k: K, v: V) {
    const l = this._data.get(k);
    if (l) {
      l.delete(v);
      if (!l.size) {
        this._data.delete(k);
      }
    }
  }

  listAndPurge(k: K): Set<V> {
    const l = this._data.get(k) ?? new Set();
    this._data.delete(k);
    return l;
  }
}
