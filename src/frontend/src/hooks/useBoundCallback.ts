import useMutatedCallback from './useMutatedCallback';

function useBoundCallback(
  fn: undefined,
  ...bound: readonly unknown[]
): undefined;

function useBoundCallback<R, Bound extends readonly unknown[], Rest extends readonly unknown[]>(
  fn: (...args: [...Bound, ...Rest]) => R,
  ...bound: Bound
): ((...args: Rest) => R);

function useBoundCallback<R, Bound extends readonly unknown[], Rest extends readonly unknown[]>(
  fn: ((...args: [...Bound, ...Rest]) => R) | undefined,
  ...bound: Bound
): ((...args: Rest) => R) | undefined;

function useBoundCallback<R, Bound extends readonly unknown[], Rest extends readonly unknown[]>(
  fn: ((...args: [...Bound, ...Rest]) => R) | undefined,
  ...bound: Bound
): ((...args: Rest) => R) | undefined {
  return useMutatedCallback(fn, (...args: Rest): [...Bound, ...Rest] => [...bound, ...args], bound);
}

export default useBoundCallback;
