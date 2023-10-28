import {
  BehaviorSubject,
  of,
  Observable,
  Notification,
  Subject,
  firstValueFrom,
} from 'rxjs';
import {
  map,
  switchMap,
  materialize,
  filter,
  shareReplay,
} from 'rxjs/operators';
import { loadHttp } from '../rxjs/loadHttp';
import { CacheMap } from '../helpers/CacheMap';

interface StoredT<T> {
  subject: Subject<T | undefined>;
  observable: Observable<Notification<T>>;
}

function ajaxSubject<R>(url: string, mapping: (o: any) => R): StoredT<R> {
  const subject = new BehaviorSubject<R | undefined>(undefined);
  const observable = subject.pipe(
    switchMap((v) =>
      (v ? of(v) : loadHttp({ url }).pipe(map(mapping))).pipe(materialize()),
    ),
    filter(({ kind }) => kind !== 'C'),
    shareReplay(1),
  );
  return { subject, observable };
}

export class SlugTracker {
  private readonly storage: CacheMap<string, StoredT<string>>;

  public constructor(apiBase: string) {
    this.storage = new CacheMap(
      (slug: string): StoredT<string> =>
        ajaxSubject(`${apiBase}/slugs/${slug}`, ({ id }): string => id),
    );
  }

  public get(slug: string): Observable<Notification<string>> {
    return this.storage.get(slug).observable;
  }

  public set(slug: string, id: string): void {
    this.storage.get(slug).subject.next(id);
  }

  public remove(slug: string): void {
    this.storage.remove(slug);
  }

  public async isAvailable(slug: string): Promise<boolean> {
    const result = await firstValueFrom(this.get(slug));
    if (result.kind === 'N') {
      return false;
    }
    if (result.error === 'not found') {
      return true;
    }
    throw new Error(result.error);
  }
}
