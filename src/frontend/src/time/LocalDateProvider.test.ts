import timezoneMock, { TimeZone } from 'timezone-mock';

import LocalDateProvider from './LocalDateProvider';

const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = HOUR_MS * 24;

function getMidnightsRange(
  provider: LocalDateProvider,
  from: number,
  to: number,
): number[] {
  const result = [];
  for (let offset = from; offset <= to; offset += 1) {
    result.push(provider.getMidnightTimestamp(offset));
  }
  return result;
}

function posMod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

describe('LocalDateProvider', () => {
  afterEach(() => {
    timezoneMock.unregister();
  });

  describe('with simple timezone (UTC)', () => {
    const tsNow = 1550923895123;
    const tsMidnight = 1550880000000;

    beforeEach(() => {
      timezoneMock.register('UTC');
    });

    describe('getMidnightTimestamp', () => {
      it('returns the timestamp of the most recent midnight', () => {
        const provider = new LocalDateProvider(tsNow);
        expect(provider.getMidnightTimestamp()).toEqual(tsMidnight);
      });

      it('returns midnight timestamps for day offsets', () => {
        const provider = new LocalDateProvider(tsNow);

        expect(getMidnightsRange(provider, -1, 2)).toEqual([
          tsMidnight - DAY_MS,
          tsMidnight,
          tsMidnight + DAY_MS,
          tsMidnight + (DAY_MS * 2),
        ]);
      });

      it('allows rolling past month and year boundaries', () => {
        const provider = new LocalDateProvider(tsNow);

        const days = 400;
        const futureMidnight = provider.getMidnightTimestamp(days);
        expect(futureMidnight).toEqual(tsMidnight + (DAY_MS * days));
      });
    });
  });

  interface TimezoneCheckOpts {
    timezoneName: TimeZone;
    tsSwitch1: number; // exact UTC time of switch from winter to summer
    tsSwitch2: number; // exact UTC time of switch from summer to winter
    tsSwitch1Winter: number; // local midnight before switch1
    tsSwitch1Summer: number; // local midnight after switch1
    tsSwitch2Summer: number; // local midnight before switch2
    tsSwitch2Winter: number; // local midnight after switch2
  }

  function commonTimezoneChecks({
    timezoneName,
    tsSwitch1,
    tsSwitch2,
    tsSwitch1Winter,
    tsSwitch1Summer,
    tsSwitch2Summer,
    tsSwitch2Winter,
  }: TimezoneCheckOpts): void {
    const phaseWinter = posMod(tsSwitch2Winter - tsSwitch1Winter, DAY_MS);
    if (phaseWinter !== 0) {
      throw new Error(`Test winter times do not match (delta: ${phaseWinter})`);
    }

    const phaseSummer = posMod(tsSwitch2Summer - tsSwitch1Summer, DAY_MS);
    if (phaseSummer !== 0) {
      throw new Error(`Test summer times do not match (delta: ${phaseSummer})`);
    }

    const midnightsAround1 = [
      tsSwitch1Winter - (DAY_MS * 2),
      tsSwitch1Winter - DAY_MS,
      tsSwitch1Winter,
      tsSwitch1Summer,
      tsSwitch1Summer + DAY_MS,
      tsSwitch1Summer + (DAY_MS * 2),
    ];

    const midnightsAround2 = [
      tsSwitch2Summer - (DAY_MS * 2),
      tsSwitch2Summer - DAY_MS,
      tsSwitch2Summer,
      tsSwitch2Winter,
      tsSwitch2Winter + DAY_MS,
      tsSwitch2Winter + (DAY_MS * 2),
    ];

    const timeOfDay = 12345678;

    beforeEach(() => {
      timezoneMock.register(timezoneName);
    });

    it('exists in a coherent world', () => {
      // This test checks that the given testing environment is consistent;
      // the winter times should have the same offset, as should the summer times

    });

    describe('getMidnightTimestamp', () => {
      it('returns local midnight timestamps in winter time', () => {
        const tsMidnight = tsSwitch1Winter - (DAY_MS * 30);

        const provider = new LocalDateProvider(tsMidnight + timeOfDay);
        expect(getMidnightsRange(provider, -1, 1)).toEqual([
          tsMidnight - DAY_MS,
          tsMidnight,
          tsMidnight + DAY_MS,
        ]);
      });

      it('returns local midnight timestamps in summer time', () => {
        const tsMidnight = tsSwitch1Summer + (DAY_MS * 30);

        const provider = new LocalDateProvider(tsMidnight + timeOfDay);
        expect(getMidnightsRange(provider, -1, 1)).toEqual([
          tsMidnight - DAY_MS,
          tsMidnight,
          tsMidnight + DAY_MS,
        ]);
      });

      it('returns local midnight timestamps around winter -> summer switch', () => {
        const tsMidnight = tsSwitch1Winter - DAY_MS;

        const provider = new LocalDateProvider(tsMidnight + timeOfDay);
        expect(getMidnightsRange(provider, -1, 4)).toEqual(midnightsAround1);
      });

      it('returns local midnight timestamps around winter <- summer switch', () => {
        const tsMidnight = tsSwitch1Summer + DAY_MS;

        const provider = new LocalDateProvider(tsMidnight + timeOfDay);
        expect(getMidnightsRange(provider, -4, 1)).toEqual(midnightsAround1);
      });

      it('returns local midnight timestamps at winter -> summer switch', () => {
        const provider1 = new LocalDateProvider(tsSwitch1Winter);
        expect(getMidnightsRange(provider1, -2, 3)).toEqual(midnightsAround1);
      });

      it('returns local midnight timestamps at winter <- summer switch', () => {
        const provider2 = new LocalDateProvider(tsSwitch1Summer);
        expect(getMidnightsRange(provider2, -3, 2)).toEqual(midnightsAround1);
      });

      it('returns local midnight timestamps at winter - summer switch', () => {
        const provider2 = new LocalDateProvider(tsSwitch1);
        expect(getMidnightsRange(provider2, -2, 3)).toEqual(midnightsAround1);
      });

      it('returns local midnight timestamps around summer -> winter switch', () => {
        const tsMidnight = tsSwitch2Summer - DAY_MS;

        const provider = new LocalDateProvider(tsMidnight + timeOfDay);
        expect(getMidnightsRange(provider, -1, 4)).toEqual(midnightsAround2);
      });

      it('returns local midnight timestamps around summer <- winter switch', () => {
        const tsMidnight = tsSwitch2Winter + DAY_MS;

        const provider = new LocalDateProvider(tsMidnight + timeOfDay);
        expect(getMidnightsRange(provider, -4, 1)).toEqual(midnightsAround2);
      });

      it('returns local midnight timestamps at summer -> winter switch', () => {
        const provider1 = new LocalDateProvider(tsSwitch2Summer);
        expect(getMidnightsRange(provider1, -2, 3)).toEqual(midnightsAround2);
      });

      it('returns local midnight timestamps at summer <- winter switch', () => {
        const provider2 = new LocalDateProvider(tsSwitch2Winter);
        expect(getMidnightsRange(provider2, -3, 2)).toEqual(midnightsAround2);
      });

      it('returns local midnight timestamps at summer - winter switch', () => {
        const provider2 = new LocalDateProvider(tsSwitch2);
        expect(getMidnightsRange(provider2, -2, 3)).toEqual(midnightsAround2);
      });
    });
  }

  describe('with daylight savings time (US/Pacific)', () => {
    // 2006-04-02 [10:00 UTC 1143972000]: PST (-7:00) begins
    // 02:00 PDT -> 03:00 PST (lose 1 hour)
    const tsSwitch1 = 1143972000000;

    // 2006-10-29 [09:00 UTC 1162112400]: PDT (-8:00) begins
    // 02:00 PST -> 01:00 PDT (gain 1 hour)
    const tsSwitch2 = 1162112400000;

    commonTimezoneChecks({
      timezoneName: 'US/Pacific',
      tsSwitch1,
      tsSwitch2,
      tsSwitch1Winter: tsSwitch1 - (HOUR_MS * 2),
      tsSwitch1Summer: tsSwitch1 + (HOUR_MS * 21),
      tsSwitch2Summer: tsSwitch2 - (HOUR_MS * 2),
      tsSwitch2Winter: tsSwitch2 + (HOUR_MS * 23),
    });
  });

  // There are problems with this timezone but it is difficult to tell if they
  // are real or caused by the mocking library itself.
//  describe('with daylight savings time switching at midnight (Brazil/East)', () => {
//    // 2006-11-05 [03:00 UTC 1162695600]: summer time (-2:00) begins
//    // 00:00 winter time -> 01:00 winter time (lose 1 hour)
//    const tsSwitch1 = 1162695600000;
//
//    // 2006-02-19 [02:00 UTC 1140314400]: winter time (-3:00) begins
//    // 00:00 summer time -> 23:00 winter time (gain 1 hour)
//    const tsSwitch2 = 1140314400000;
//
//    commonTimezoneChecks({
//      timezoneName: 'Brazil/East',
//      tsSwitch1,
//      tsSwitch2,
//      tsSwitch1Winter: tsSwitch1,
//      tsSwitch1Summer: tsSwitch1 + (HOUR_MS * 23),
//      tsSwitch2Summer: tsSwitch2,
//      tsSwitch2Winter: tsSwitch2 + (HOUR_MS * 25),
//    });
//  });
});
