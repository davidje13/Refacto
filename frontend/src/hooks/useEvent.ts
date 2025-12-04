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
