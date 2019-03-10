import { useMemo } from 'react';

export default function useBoundCallback(fn, ...bound) {
  return useMemo(
    () => fn && ((...args) => fn(...bound, ...args)),
    [fn, ...bound],
  );
}
