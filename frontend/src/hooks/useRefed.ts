import { useLayoutEffect, useRef } from 'react';

export const useRefed = <T>(value: T): { readonly current: T } => {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};
