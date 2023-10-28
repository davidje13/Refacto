import { useRef, useMemo } from 'react';

type Consumer<T> = (value: T) => void;

export function useDebounced<T>(fn: Consumer<T>, initial?: T): Consumer<T>;

export function useDebounced<T>(
  fn: Consumer<T> | undefined,
  initial?: T,
): Consumer<T> | undefined;

export function useDebounced<T>(
  fn: Consumer<T> | undefined,
  initial?: T,
): Consumer<T> | undefined {
  const ref = useRef(initial);
  return useMemo(() => {
    if (!fn) {
      return undefined;
    }
    return (v: T): void => {
      if (ref.current !== v) {
        ref.current = v;
        fn?.(v);
      }
    };
  }, [fn, ref]);
}
