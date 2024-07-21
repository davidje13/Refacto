import { useState, useLayoutEffect } from 'react';
import { useDebounced } from '../useDebounced';

export interface Size {
  width: number;
  height: number;
}

const getWindowSize = (): Size => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

export function useWindowSize<T>(conversion: (size: Size) => T): T {
  const [state, setStateRaw] = useState(() => conversion(getWindowSize()));
  const setState = useDebounced(setStateRaw, state);

  useLayoutEffect(() => {
    const updateWindowSize = () => setState(conversion(getWindowSize()));
    window.addEventListener('resize', updateWindowSize, { passive: true });
    updateWindowSize();
    return () => window.removeEventListener('resize', updateWindowSize);
  }, [conversion, setState]);

  return state;
}
