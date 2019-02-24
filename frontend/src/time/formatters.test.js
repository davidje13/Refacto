import { formatDate, formatTime } from './formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('returns a string representing the date in the browser locale', () => {
      const timestamp = 1234567890;

      // Results will depend on current environment
      // hence this less-than-ideal test expectation
      const expected = new Date(timestamp).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
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
});
