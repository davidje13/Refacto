import timezoneMock from 'timezone-mock';

import localDateTracker from './localDateTracker';

class MockClock {
  constructor(time = 0) {
    this.time = time;
  }

  set(millis) {
    this.time = millis;
  }

  now() {
    return this.time;
  }

  advanceByTime(millis) {
    this.time += millis;
    jest.runTimersToTime(millis); // advanceTimersByTime
  }
}

describe('localDateTracker', () => {
  const day1 = 1123200000;
  const day2 = 1209600000;

  let callback;
  let mockClock;

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

    const provider = callback.mock.calls[0][0];
    expect(provider).not.toEqual(null);
    expect(provider.getMidnightTimestamp()).toEqual(day1);
  });

  it('schedules an update at the next midnight', () => {
    mockClock.set(day2 - 100000);
    localDateTracker(callback, mockClock);

    expect(callback).toHaveBeenCalled();
    const provider1 = callback.mock.calls[0][0];
    expect(provider1.getMidnightTimestamp()).toEqual(day1);

    callback.mockClear();

    mockClock.advanceByTime(99999);
    expect(callback).not.toHaveBeenCalled();

    mockClock.advanceByTime(1);
    expect(callback).toHaveBeenCalled();

    const provider2 = callback.mock.calls[0][0];
    expect(provider2.getMidnightTimestamp()).toEqual(day2);
  });

  it('adjusts if a timer fires early', () => {
    mockClock.set(day2 - 100000);
    localDateTracker(callback, mockClock);

    callback.mockClear();

    jest.runTimersToTime(5000); // timer slip
    mockClock.advanceByTime(95000);
    expect(callback).not.toHaveBeenCalled();

    mockClock.advanceByTime(5000);
    expect(callback).toHaveBeenCalled();
  });
});
