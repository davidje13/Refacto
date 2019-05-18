import { cleanup } from 'react-testing-library';
import { matcherHint, printReceived, printExpected } from 'jest-matcher-utils';
import fastDeepEqual from 'fast-deep-equal';
import 'jest-dom/extend-expect';

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

function toHaveMockProps(element, checkOrKey, value = undefined) {
  if (!element) {
    throw new Error('Cannot use toHaveMockProps on non-element');
  }
  let check = checkOrKey;
  if (typeof checkOrKey === 'string') {
    check = { [checkOrKey]: value };
  }

  const elProps = element.mockProps;

  const mismatches = [];
  Object.keys(check).forEach((key) => {
    const expected = check[key];
    const actual = elProps[key];
    if (expected === undefined) {
      if (actual === undefined) {
        mismatches.push(key);
      }
    } else if (!fastDeepEqual(expected, actual)) {
      mismatches.push(key);
    }
  });

  return {
    pass: (mismatches.length === 0),
    message: () => [
      matcherHint(`${this.isNot ? '.not' : ''}.toHaveMockProps`, 'element', 'checkOrKey', 'value'),
      '',
      `Expected props ${this.isNot ? 'not to' : 'to'} match`,
      `  ${printExpected(check)}`,
      'Received',
      `  ${printReceived(elProps)}`,
      `(differences in ${mismatches.join(', ')})`,
    ].join('\n'),
  };
}

expect.extend({
  toContainQuerySelector,
  toHaveMockProps,
});

afterEach(cleanup);
