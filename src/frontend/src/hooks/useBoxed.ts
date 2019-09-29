import { useRef, useLayoutEffect } from 'react';

export interface BoxObject<T> {
  readonly current: T;
}

export default function useBoxed<T>(value: T): BoxObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
