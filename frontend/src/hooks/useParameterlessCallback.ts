import useMutatedCallback from './useMutatedCallback';

function useParameterlessCallback<R, A extends any[]>(
  fn: (...args: A) => R,
  ...overrideParams: A
): () => R;

function useParameterlessCallback<R, A extends any[]>(
  fn: ((...args: A) => R) | undefined,
  ...overrideParams: A
): (() => R) | undefined;

function useParameterlessCallback<R, A extends any[]>(
  fn: ((...args: A) => R) | undefined,
  ...overrideParams: A
): (() => R) | undefined {
  return useMutatedCallback(fn, () => overrideParams, overrideParams);
}

export default useParameterlessCallback;
