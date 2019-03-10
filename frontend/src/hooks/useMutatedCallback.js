import { useMemo } from 'react';

export default function useMutatedCallback(fn, conversion, inputs) {
  return useMemo(
    () => (fn && ((...args) => fn(...conversion(...args)))),
    inputs && [fn, ...inputs],
  );
}
