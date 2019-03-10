import { useRef, useLayoutEffect } from 'react';

export default function useBoxed(value) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
