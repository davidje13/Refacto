import { useState, useLayoutEffect, useCallback } from 'react';
import useDebounced from '../useDebounced';

interface Size {
  width: number;
  height: number;
}

function getWindowSize(): Size {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function passthrough(x: Size): Size {
  return x;
}

function useWindowSize(
  conversion?: null,
  deps?: null,
): Size;

function useWindowSize<T>(
  conversion: (size: Size) => T,
  deps?: string[] | null,
): T;

function useWindowSize<T>(
  conversion: ((size: Size) => T) | null = null,
  deps: string[] | null = null,
): T {
  const conv = useCallback(
    conversion || passthrough,
    deps || (conversion === null ? [] : undefined) as any,
  ) as (size: Size) => T;
  const [state, setStateRaw] = useState(() => conv(getWindowSize()));
  const setState = useDebounced(setStateRaw);

  useLayoutEffect(() => {
    const updateWindowSize = (): void => setState(conv(getWindowSize()));
    window.addEventListener('resize', updateWindowSize, { passive: true });
    updateWindowSize();
    return (): void => window.removeEventListener('resize', updateWindowSize);
  }, [conv, setState]);

  return state;
}

export default useWindowSize;
