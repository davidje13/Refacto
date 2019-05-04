import { Notification, NotificationKind } from 'rxjs';
import { useState, useLayoutEffect, useCallback } from 'react';

function isMaterialized(data, materialized) {
  if (typeof materialized === 'boolean') {
    return materialized;
  }
  return (data instanceof Notification);
}

export default function useObservable(
  observableGenerator,
  args = [],
  { materialized = 'detect' } = {},
) {
  const [state, setState] = useState([null, null]);
  const generator = useCallback(observableGenerator, args);

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
            setState([d.value, d.error]);
          }
        } else {
          setState([d, null]);
        }
      },
      (e) => setState([null, e]),
    );
    return () => sub.unsubscribe();
  }, [setState, generator, materialized]);

  return state;
}
