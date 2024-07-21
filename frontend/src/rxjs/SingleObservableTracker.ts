import { ReplaySubject } from 'rxjs';

export class SingleObservableTracker<V> {
  private readonly data = new ReplaySubject<V>(1);

  public get(): ReplaySubject<V> {
    return this.data;
  }

  public set(value: V) {
    this.data.next(value);
  }
}
