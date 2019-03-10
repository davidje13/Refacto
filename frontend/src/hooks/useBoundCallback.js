import { useCallback } from 'react';

export default function useBoundCallback(fn, ...bound) {
  return useCallback((...args) => {
    fn?.(...bound, ...args);
  }, [fn, ...bound]);
}
