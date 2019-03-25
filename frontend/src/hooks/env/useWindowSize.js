import { useState, useLayoutEffect, useCallback } from 'react';

function getWindowSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function passthrough(x) {
  return x;
}

export default function useWindowSize(conversion = null, deps = null) {
  const conv = useCallback(
    conversion || passthrough,
    deps || (conversion === null ? [] : undefined),
  );
  const [state, setState] = useState(() => conv(getWindowSize()));

  useLayoutEffect(() => {
    const updateWindowSize = () => setState(conv(getWindowSize()));
    window.addEventListener('resize', updateWindowSize, { passive: true });
    updateWindowSize();
    return () => window.removeEventListener('resize', updateWindowSize);
  }, [conv, setState]);

  return state;
}
