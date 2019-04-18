import { ReplaySubject } from 'rxjs';
import CacheMap from '../helpers/CacheMap';

export default class ObservableTracker extends CacheMap {
  constructor() {
    super(() => new ReplaySubject(1));
  }

  set(key, value) {
    this.get(key).next(value);
  }
}
