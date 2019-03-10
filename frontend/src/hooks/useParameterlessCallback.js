import useMutatedCallback from './useMutatedCallback';

export default function useParameterlessCallback(fn, ...overrideParams) {
  return useMutatedCallback(fn, () => overrideParams, overrideParams);
}
