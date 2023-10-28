import { useState, useLayoutEffect, useCallback } from 'react';
import { useDebounced } from '../useDebounced';

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

export function useWindowSize(conversion?: undefined, deps?: undefined): Size;

export function useWindowSize<T>(
  conversion: (size: Size) => T,
  deps?: React.DependencyList,
): T;

export function useWindowSize<T>(
  conversion?: (size: Size) => T,
  deps?: React.DependencyList,
): T {
  const resolvedConversion = (conversion || passthrough) as (size: Size) => T;
  const conv = useCallback(resolvedConversion, deps || [resolvedConversion]);
  const [state, setStateRaw] = useState(() => conv(getWindowSize()));
  const setState = useDebounced(setStateRaw, state);

  useLayoutEffect(() => {
    const updateWindowSize = (): void => setState(conv(getWindowSize()));
    window.addEventListener('resize', updateWindowSize, { passive: true });
    updateWindowSize();
    return (): void => window.removeEventListener('resize', updateWindowSize);
  }, [conv, setState]);

  return state;
}
