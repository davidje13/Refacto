import useMutatedCallback from './useMutatedCallback';

function useParameterlessCallback(
  fn: undefined,
  ...overrideParams: readonly unknown[]
): undefined;

function useParameterlessCallback<R, A extends readonly unknown[]>(
  fn: (...args: A) => R,
  ...overrideParams: A
): () => R;

function useParameterlessCallback<R, A extends readonly unknown[]>(
  fn: ((...args: A) => R) | undefined,
  ...overrideParams: A
): (() => R) | undefined;

function useParameterlessCallback<R, A extends readonly unknown[]>(
  fn: ((...args: A) => R) | undefined,
  ...overrideParams: A
): (() => R) | undefined {
  return useMutatedCallback(fn, () => overrideParams, overrideParams);
}

export default useParameterlessCallback;
