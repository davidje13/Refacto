import { ReplaySubject } from 'rxjs';
import CacheMap from '../helpers/CacheMap';

export default class ObservableTracker<K, V> extends CacheMap<K, ReplaySubject<V>> {
  public constructor() {
    super(() => new ReplaySubject<V>(1));
  }

  public set(key: K, value: V): void {
    this.get(key).next(value);
  }
}
