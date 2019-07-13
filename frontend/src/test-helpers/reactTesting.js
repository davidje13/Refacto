import { cleanup } from '@testing-library/react';
import { matcherHint, printReceived, printExpected } from 'jest-matcher-utils';
import { queryAllBy } from './queries';
import '@testing-library/jest-dom/extend-expect';

function toContainElementWith(base, query) {
  if (!base) {
    throw new Error('Cannot use toContainElementWith on non-element');
  }
  const element = base.container || base;
  const expected =
    `${this.isNot ? 'no elements' : 'an element'} ${query.description}`;

  return {
    pass: queryAllBy(element, query).length > 0,
    message: () => [
      matcherHint(`${this.isNot ? '.not' : ''}.toContainElementWith`, 'element', 'query'),
      '',
      'Expected',
      `  ${printExpected(expected)}`,
      'Received',
      `  ${printReceived(element)}`,
    ].join('\n'),
  };
}

expect.extend({
  toContainElementWith,
});

afterEach(cleanup);
