import { useState, useRef, useLayoutEffect } from 'react';
import LocalDateProvider from '../../time/LocalDateProvider';
import localDateTracker, { NowGetter } from '../../time/localDateTracker';

export default function useLocalDateProvider(clock: NowGetter = Date): LocalDateProvider {
  const [state, setState] = useState(() => new LocalDateProvider(clock.now()));
  const stateRef = useRef(state);

  useLayoutEffect(() => {
    const tracker = localDateTracker(
      (provider) => {
        if (
          provider.getMidnightTimestamp(0) ===
          stateRef.current.getMidnightTimestamp(0)
        ) {
          // prevent initial double-render
          return;
        }
        stateRef.current = provider;
        setState(provider);
      },
      clock,
    );
    return (): void => tracker.stop();
  }, [setState, stateRef, clock]);

  return state;
}
