import { useLayoutEffect, useRef, useState } from 'react';

export const useEvent = <Fn extends (...args: any) => any>(fn: Fn) => {
  const latest = useRef(fn);
  useLayoutEffect(() => {
    latest.current = fn;
  }, [fn]);
  const [stable] = useState(
    () =>
      (...args: Parameters<Fn>): ReturnType<Fn> =>
        latest.current.apply(undefined, args),
  );
  return stable;
};

export const useBoundEvent = <
  Bound extends unknown[],
  Rest extends unknown[],
  R,
>(
  fn: (...args: [...Bound, ...Rest]) => R,
  ...bound: Bound
) => useEvent((...rest: Rest) => fn(...bound, ...rest));

export const useOptionalBoundEvent = <
  Bound extends unknown[],
  Rest extends unknown[],
  R,
>(
  fn: ((...args: [...Bound, ...Rest]) => R) | undefined,
  ...bound: Bound
) => {
  const wrapped = useEvent((...rest: Rest) => fn?.(...bound, ...rest));
  return fn && wrapped;
};
