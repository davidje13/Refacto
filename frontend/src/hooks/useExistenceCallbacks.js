import { useLayoutEffect } from 'react';

export default function useExistenceCallbacks(onAppear, onDisappear, ...params) {
  useLayoutEffect(() => {
    onAppear(...params);
    return () => {
      onDisappear?.(...params);
    };
  }, [onAppear, onDisappear, ...params]);
}
