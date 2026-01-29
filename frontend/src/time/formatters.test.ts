import {
  formatDate,
  formatTime,
  formatDateTime,
  formatDurationShort,
} from './formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('returns a string representing the date in the browser locale', () => {
      const timestamp = 1234567890;

      // Results will depend on current environment
      // hence this less-than-ideal test expectation
      const expected = new Date(timestamp).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      // Example: en-GB: "1 January 1970"

      const formatted = formatDate(timestamp);
      expect(formatted).toEqual(expected);
    });
  });

  describe('formatTime', () => {
    it('returns a string representing the date in the browser locale', () => {
      const timestamp = 1234567890;

      // Results will depend on current environment
      // hence this less-than-ideal test expectation
      const expected = new Date(timestamp).toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
      // Example: en-GB: "12:34"

      const formatted = formatTime(timestamp);
      expect(formatted).toEqual(expected);
    });
  });

  describe('formatDateTime', () => {
    it('returns a string representing the date and time in the browser locale', () => {
      const timestamp = 1234567890;

      // Results will depend on current environment
      // hence this less-than-ideal test expectation
      const expected = new Date(timestamp).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      // Example: en-GB: "1 January 1970 12:34"

      const formatted = formatDateTime(timestamp);
      expect(formatted).toEqual(expected);
    });
  });

  describe('formatDurationShort', () => {
    it('returns a m:ss representation for small durations', () => {
      expect(formatDurationShort(500)).toEqual('0:00');
      expect(formatDurationShort(10000)).toEqual('0:10');
      expect(formatDurationShort(60000)).toEqual('1:00');
      expect(formatDurationShort(121000)).toEqual('2:01');
    });

    it('returns a h:mm:ss representation for large durations', () => {
      expect(formatDurationShort(60 * 60 * 1000)).toEqual('1:00:00');
      expect(formatDurationShort(100 * 60 * 60 * 1000)).toEqual('100:00:00');
    });
  });
});
