import { cleanup } from 'react-testing-library';
import { matcherHint, printReceived, printExpected } from 'jest-matcher-utils';
// import 'jest-dom/extend-expect';

function toContainQuerySelector(element, selector) {
  if (!element) {
    throw new Error('Cannot use toContainQuerySelector on non-element');
  }
  return {
    pass: Boolean(element.querySelector(selector)),
    message: () => [
      matcherHint(`${this.isNot ? '.not' : ''}.toContainQuerySelector`, 'element', 'selector'),
      '',
      `Expected ${this.isNot ? 'no elements' : 'an element'} matching`,
      `  ${printExpected(selector)}`,
      'Received',
      `  ${printReceived(element)}`,
    ].join('\n'),
  };
}

expect.extend({
  toContainQuerySelector,
});

afterEach(cleanup);
