import useMutatedCallback from './useMutatedCallback';

export default function useBoundCallback(fn, ...bound) {
  return useMutatedCallback(fn, (...args) => [...bound, ...args], bound);
}
