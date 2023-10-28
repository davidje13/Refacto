import { useMutatedCallback } from './useMutatedCallback';

export function useBoundCallback(
  fn: undefined,
  ...bound: readonly unknown[]
): undefined;

export function useBoundCallback<
  R,
  Bound extends readonly unknown[],
  Rest extends readonly unknown[],
>(
  fn: (...args: [...Bound, ...Rest]) => R,
  ...bound: Bound
): (...args: Rest) => R;

export function useBoundCallback<
  R,
  Bound extends readonly unknown[],
  Rest extends readonly unknown[],
>(
  fn: ((...args: [...Bound, ...Rest]) => R) | undefined,
  ...bound: Bound
): ((...args: Rest) => R) | undefined;

export function useBoundCallback<
  R,
  Bound extends readonly unknown[],
  Rest extends readonly unknown[],
>(
  fn: ((...args: [...Bound, ...Rest]) => R) | undefined,
  ...bound: Bound
): ((...args: Rest) => R) | undefined {
  return useMutatedCallback(
    fn,
    (...args: Rest): [...Bound, ...Rest] => [...bound, ...args],
    bound,
  );
}
