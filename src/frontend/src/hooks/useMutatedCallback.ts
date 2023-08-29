import { useMemo } from 'react';

function useMutatedCallback(
  fn: undefined,
  conversion: () => unknown,
  deps: React.DependencyList,
): undefined;

function useMutatedCallback<
  R,
  A extends readonly unknown[],
  B extends readonly unknown[],
>(
  fn: (...args: A) => R,
  conversion: (...args: B) => A,
  deps: React.DependencyList,
): (...args: B) => R;

function useMutatedCallback<
  R,
  A extends readonly unknown[],
  B extends readonly unknown[],
>(
  fn: ((...args: A) => R) | undefined,
  conversion: (...args: B) => A,
  deps: React.DependencyList,
): ((...args: B) => R) | undefined;

function useMutatedCallback<
  R,
  A extends readonly unknown[],
  B extends readonly unknown[],
>(
  fn: ((...args: A) => R) | undefined,
  conversion: (...args: B) => A,
  deps: React.DependencyList,
): ((...args: B) => R) | undefined {
  return useMemo(
    () => fn && ((...args: B): R => fn(...conversion(...args))),
    [fn, ...deps],
  );
}

export default useMutatedCallback;
