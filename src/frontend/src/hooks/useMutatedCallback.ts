import { useMemo } from 'react';

function useMutatedCallback(
  fn: undefined,
  conversion: any,
  inputs: any[],
): undefined;

function useMutatedCallback<R, A extends any[], B extends any[]>(
  fn: (...args: A) => R,
  conversion: (...args: B) => A,
  inputs: any[],
): (...args: B) => R;

function useMutatedCallback<R, A extends any[], B extends any[]>(
  fn: ((...args: A) => R) | undefined,
  conversion: (...args: B) => A,
  inputs: any[],
): ((...args: B) => R) | undefined;

function useMutatedCallback<R, A extends any[], B extends any[]>(
  fn: ((...args: A) => R) | undefined,
  conversion: (...args: B) => A,
  inputs: any[],
): ((...args: B) => R) | undefined {
  return useMemo(
    () => (fn && ((...args: B): R => fn(...conversion(...args)))),
    [fn, ...inputs],
  );
}

export default useMutatedCallback;
