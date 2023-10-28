import { useMutatedCallback } from './useMutatedCallback';

export function useParameterlessCallback(
  fn: undefined,
  ...overrideParams: readonly unknown[]
): undefined;

export function useParameterlessCallback<R, A extends readonly unknown[]>(
  fn: (...args: A) => R,
  ...overrideParams: A
): () => R;

export function useParameterlessCallback<R, A extends readonly unknown[]>(
  fn: ((...args: A) => R) | undefined,
  ...overrideParams: A
): (() => R) | undefined;

export function useParameterlessCallback<R, A extends readonly unknown[]>(
  fn: ((...args: A) => R) | undefined,
  ...overrideParams: A
): (() => R) | undefined {
  return useMutatedCallback(fn, () => overrideParams, overrideParams);
}
