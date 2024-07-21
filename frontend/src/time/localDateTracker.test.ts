import timezoneMock from 'timezone-mock';

import { localDateTracker } from './localDateTracker';
import { type LocalDateProvider } from './LocalDateProvider';

class MockClock {
  private time: number;

  public constructor(time = 0) {
    this.time = time;
  }

  public set(millis: number) {
    this.time = millis;
  }

  public now(): number {
    return this.time;
  }

  public advanceByTime(millis: number) {
    this.advanceWallTimeOnly(millis);
    this.advanceTickTimeOnly(millis);
  }

  public advanceWallTimeOnly(millis: number) {
    this.time += millis;
  }

  public advanceTickTimeOnly = (millis: number) => {
    jest.advanceTimersByTime(millis);
  };
}

describe('localDateTracker', () => {
  const day1 = 1123200000;
  const day2 = 1209600000;

  let callback: jest.Mock<void, [LocalDateProvider]>;
  let mockClock: MockClock;

  beforeEach(() => {
    timezoneMock.register('UTC');
    callback = jest.fn().mockName('callback');
    mockClock = new MockClock();
  });

  afterEach(() => {
    timezoneMock.unregister();
  });

  it('invokes the callback with a LocalDateProvider immediately', () => {
    mockClock.set(day1 + 12345678);
    localDateTracker(callback, mockClock);

    expect(callback).toHaveBeenCalled();

    const provider = callback.mock.calls[0]?.[0];
    expect(provider?.getMidnightTimestamp()).toEqual(day1);
  });

  it('schedules an update at the next midnight', () => {
    mockClock.set(day2 - 100000);
    localDateTracker(callback, mockClock);

    expect(callback).toHaveBeenCalled();
    const provider1 = callback.mock.calls[0]?.[0];
    expect(provider1?.getMidnightTimestamp()).toEqual(day1);

    callback.mockClear();

    mockClock.advanceByTime(99999);
    expect(callback).not.toHaveBeenCalled();

    mockClock.advanceByTime(1);
    expect(callback).toHaveBeenCalled();

    const provider2 = callback.mock.calls[0]?.[0];
    expect(provider2?.getMidnightTimestamp()).toEqual(day2);
  });

  it('adjusts if a timer fires early', () => {
    mockClock.set(day2 - 100000);
    localDateTracker(callback, mockClock);

    callback.mockClear();

    mockClock.advanceTickTimeOnly(5000); // timer slip
    mockClock.advanceByTime(95000);
    expect(callback).not.toHaveBeenCalled();

    mockClock.advanceByTime(5000);
    expect(callback).toHaveBeenCalled();
  });

  it('checks periodically in case machine slept', () => {
    mockClock.set(day2 - 100000);
    localDateTracker(callback, mockClock);

    callback.mockClear();

    mockClock.advanceWallTimeOnly(95000); // timer slip
    mockClock.advanceByTime(65000);
    expect(callback).toHaveBeenCalled();

    callback.mockClear();

    // only trigger if date actually changed
    mockClock.advanceByTime(65000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('stops checking if stop is called', () => {
    mockClock.set(day2 - 100000);
    const tracker = localDateTracker(callback, mockClock);

    callback.mockClear();

    tracker.stop();
    mockClock.advanceByTime(105000);
    expect(callback).not.toHaveBeenCalled();
  });
});
