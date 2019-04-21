import { ReplaySubject } from 'rxjs';

export default class SingleObservableTracker {
  data = new ReplaySubject(1);

  get() {
    return this.data;
  }

  set(value) {
    this.data.next(value);
  }
}
