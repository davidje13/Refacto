import { useCallback } from 'react';

export default function useStrippedCallback(fn, ...replacementParams) {
  return useCallback(() => {
    fn?.(...replacementParams);
  }, [fn, ...replacementParams]);
}
