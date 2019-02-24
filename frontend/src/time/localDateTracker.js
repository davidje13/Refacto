import LocalDateProvider from './LocalDateProvider';

export default function localDateTracker(callback, clock = Date) {
  let currentMidnight = 0;
  let timer = null;

  const update = () => {
    const now = clock.now();
    const provider = new LocalDateProvider(now);
    const nextMidnight = provider.getMidnightTimestamp(1);
    if (nextMidnight !== currentMidnight) {
      currentMidnight = nextMidnight;
      callback(provider);
    }
    timer = setTimeout(update, Math.max(nextMidnight - now, 1000));
  };
  update();

  return {
    stop: () => {
      clearTimeout(timer);
    },
  };
}
