import { useRef, useLayoutEffect, RefObject } from 'react';

export default function useBoxed<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
