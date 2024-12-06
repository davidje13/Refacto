import { CacheMap } from '../helpers/CacheMap';
import { AsyncValue } from '../helpers/AsyncValue';

export class AsyncValueMap<K, V> extends CacheMap<K, AsyncValue<V>> {
  public constructor() {
    super(() => new AsyncValue<V>());
  }

  public set(key: K, value: V) {
    this.get(key).set(value);
  }
}
