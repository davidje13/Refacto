import { LocalDateProvider } from './LocalDateProvider';

// If machine sleeps or thread otherwise hangs, the timer will pause.
// Set a maximum polling interval to ensure it recovers quickly.
const MAX_DELAY = 60 * 1000;
const MAX_DELAY_HIDDEN = 10 * 60 * 1000;
const MIN_DELAY = 1000;

export interface NowGetter {
  now(): number;
}

export interface LocalDateTrackerRef {
  stop(): void;
}

export function localDateTracker(
  callback: (provider: LocalDateProvider) => void,
  clock: NowGetter = Date,
): LocalDateTrackerRef {
  let currentMidnight = 0;
  let timer: NodeJS.Timeout | undefined;

  const update = () => {
    const now = clock.now();
    const provider = new LocalDateProvider(now);
    const nextMidnight = provider.getMidnightTimestamp(1);

    if (timer) {
      clearTimeout(timer);
    }
    const maxDelay = document.hidden ? MAX_DELAY_HIDDEN : MAX_DELAY;
    const delay = Math.max(Math.min(nextMidnight - now, maxDelay), MIN_DELAY);
    timer = setTimeout(update, delay);

    if (nextMidnight !== currentMidnight) {
      currentMidnight = nextMidnight;
      callback(provider);
    }
  };
  update();

  window.addEventListener('focus', update);

  return {
    stop: () => {
      if (timer) {
        clearTimeout(timer);
      }
      window.removeEventListener('focus', update);
    },
  };
}
