import { useMemo } from 'react';

export default function useParameterlessCallback(fn, ...replacementParams) {
  return useMemo(
    () => fn && (() => fn(...replacementParams)),
    [fn, ...replacementParams],
  );
}
