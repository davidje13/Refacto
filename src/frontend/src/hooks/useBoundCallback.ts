import useMutatedCallback from './useMutatedCallback';

// https://github.com/Microsoft/TypeScript/issues/16746
// https://github.com/microsoft/TypeScript/issues/6229

function useBoundCallback<R, B extends any[]>(
  fn: (...args: B) => R
): (...args: B) => R;

function useBoundCallback<R, A1, B extends any[]>(
  fn: (a1: A1, ...args: B) => R,
  a1: A1
): (...args: B) => R;

function useBoundCallback<R, A1, B extends any[]>(
  fn: ((a1: A1, ...args: B) => R) | undefined,
  a1: A1
): ((...args: B) => R) | undefined;

function useBoundCallback<R, A1, A2, B extends any[]>(
  fn: (a1: A1, a2: A2, ...args: B) => R,
  a1: A1,
  a2: A2,
): (...args: B) => R;

function useBoundCallback<R, A1, A2, B extends any[]>(
  fn: ((a1: A1, a2: A2, ...args: B) => R) | undefined,
  a1: A1,
  a2: A2,
): ((...args: B) => R) | undefined;

function useBoundCallback<R, A1, A2, A3, B extends any[]>(
  fn: ((a1: A1, a2: A2, a3: A3, ...args: B) => R) | undefined,
  a1: A1,
  a2: A2,
  a3: A3,
): ((...args: B) => R) | undefined;

function useBoundCallback<R, A1, A2, A3, A4, B extends any[]>(
  fn: ((a1: A1, a2: A2, a3: A3, a4: A4, ...args: B) => R) | undefined,
  a1: A1,
  a2: A2,
  a3: A3,
  a4: A4,
): ((...args: B) => R) | undefined;

function useBoundCallback<R, A extends any[]>(
  fn: ((...args: any[]) => R) | undefined,
  ...bound: A
): ((...args: any[]) => R) | undefined {
  return useMutatedCallback(fn, (...args: any[]) => [...bound, ...args], bound);
}

export default useBoundCallback;

type ConditionalUseBoundCallback = typeof useBoundCallback | ((...p: any[]) => undefined);

export const useConditionalBoundCallback = (
  condition: boolean,
): ConditionalUseBoundCallback => {
  if (condition) {
    return useBoundCallback;
  }

  // must still use useMutatedCallback so hooks are called in same order if condition changes
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  return (_: any, ...bound: any[]): undefined => useMutatedCallback(
    undefined,
    undefined,
    bound.map(() => null),
  );
};
