import { Notification, NotificationKind, Observable } from 'rxjs';
import { useState, useLayoutEffect, useCallback } from 'react';

type MaterializedOptionT = boolean | 'detect';
interface ObservableOptions {
  materialized?: MaterializedOptionT;
}

export type ObservableState<T> = [T | null, string | null];

function isMaterialized(
  data: unknown,
  materialized: MaterializedOptionT,
): data is Notification<unknown> {
  if (typeof materialized === 'boolean') {
    return materialized;
  }
  return data instanceof Notification;
}

export default function useObservable<T>(
  observableGenerator: () => Observable<T | Notification<T>> | undefined,
  deps: React.DependencyList = [],
  { materialized = 'detect' }: ObservableOptions = {},
): ObservableState<T> {
  const [state, setState] = useState<ObservableState<T>>([null, null]);
  const generator = useCallback(observableGenerator, deps);

  useLayoutEffect(() => {
    setState([null, null]);

    const observable = generator();
    if (!observable) {
      return undefined;
    }

    const sub = observable.subscribe(
      (d) => {
        if (isMaterialized(d, materialized)) {
          if (d.kind !== NotificationKind.COMPLETE) {
            setState([d.value || null, d.error || null]);
          }
        } else {
          setState([d, null]);
        }
      },
      (e) => setState([null, e]),
    );
    return (): void => sub.unsubscribe();
  }, [setState, generator, materialized]);

  return state;
}
