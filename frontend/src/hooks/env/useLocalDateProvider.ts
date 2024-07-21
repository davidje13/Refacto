import { useState, useRef, useLayoutEffect } from 'react';
import { LocalDateProvider } from '../../time/LocalDateProvider';
import { localDateTracker, NowGetter } from '../../time/localDateTracker';

function readTime(clock: NowGetter | number): number {
  if (typeof clock === 'number') {
    return clock;
  }
  return clock.now();
}

export function useLocalDateProvider(
  clock: NowGetter | number = Date,
): LocalDateProvider {
  const [state, setState] = useState(
    () => new LocalDateProvider(readTime(clock)),
  );
  const stateRef = useRef(state);

  useLayoutEffect(() => {
    if (typeof clock === 'number') {
      return undefined;
    }
    const tracker = localDateTracker((provider) => {
      if (
        provider.getMidnightTimestamp(0) ===
        stateRef.current.getMidnightTimestamp(0)
      ) {
        // prevent initial double-render
        return;
      }
      stateRef.current = provider;
      setState(provider);
    }, clock);
    return () => tracker.stop();
  }, [setState, stateRef, clock]);

  return state;
}
