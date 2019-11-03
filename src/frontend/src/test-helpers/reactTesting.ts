import { cleanup, RenderResult } from '@testing-library/react';
import {
  matcherHint,
  printReceived,
  printExpected,
  MatcherHintOptions,
} from 'jest-matcher-utils';
import { queryAllBy, Query } from './queries';
import '@testing-library/jest-dom/extend-expect';

interface CustomMatcherResult {
  pass: boolean;
  message: () => string;
}

function toContainElementWith(
  this: MatcherHintOptions,
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
      matcherHint(`${this.isNot ? '.not' : ''}.toContainElementWith`, 'element', 'query'),
      '',
      'Expected',
      `  ${printExpected(expected)}`,
      'Received',
      `  ${printReceived(element)}`,
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
