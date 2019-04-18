import { BehaviorSubject, of } from 'rxjs';
import {
  map,
  switchMap,
  materialize,
  filter,
  shareReplay,
} from 'rxjs/operators';
import loadHttp from '../rxjs/loadHttp';
import CacheMap from '../helpers/CacheMap';

function ajaxSubject(url, mapping) {
  const subject = new BehaviorSubject(undefined);
  const observable = subject.pipe(
    switchMap((v) => (
      v ? of(v) : loadHttp(url).pipe(map(mapping))
    ).pipe(materialize())),
    filter(({ kind }) => (kind !== 'C')),
    shareReplay(1),
  );
  return { subject, observable };
}

export default class SlugTracker extends CacheMap {
  constructor(apiBase) {
    super((slug) => ajaxSubject(`${apiBase}/slugs/${slug}`, ({ id }) => id));
  }

  get(slug) {
    return super.get(slug).observable;
  }

  set(slug, id) {
    super.get(slug).subject.next(id);
  }
}
