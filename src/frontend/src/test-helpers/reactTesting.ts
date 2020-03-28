import { cleanup, RenderResult } from '@testing-library/react';
import { queryAllBy, Query } from './queries';
import '@testing-library/jest-dom/extend-expect';

interface CustomMatcherResult {
  pass: boolean;
  message: () => string;
}

function toContainElementWith(
  this: jest.MatcherContext,
  base: RenderResult,
  query: Query,
): CustomMatcherResult {
  if (!base) {
    throw new Error('Cannot use toContainElementWith on non-element');
  }
  const element = base.container || base;
  const expected =
    `${this.isNot ? 'no elements' : 'an element'} ${query.description}`;

  return {
    pass: queryAllBy(element, query).length > 0,
    message: (): string => [
      this.utils.matcherHint(`${this.isNot ? '.not' : ''}.toContainElementWith`, 'element', 'query'),
      '',
      'Expected',
      `  ${this.utils.printExpected(expected)}`,
      'Received',
      `  ${this.utils.printReceived(element)}`,
    ].join('\n'),
  };
}

declare global {
  namespace jest { // eslint-disable-line @typescript-eslint/no-namespace
    interface Matchers<R, T> {
      toContainElementWith: (query: Query) => R;
    }
  }
}

expect.extend({
  toContainElementWith,
});

afterEach(cleanup);
