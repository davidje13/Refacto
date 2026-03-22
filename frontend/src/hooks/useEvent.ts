import { useState } from 'react';
import { useRefed } from './useRefed';

export const useEvent = <Fn extends (...args: any) => any>(fn: Fn) => {
  const latest = useRefed(fn);
  const [stable] = useState(
    () =>
      (...args: Parameters<Fn>): ReturnType<Fn> =>
        latest.current.apply(undefined, args),
  );
  return stable;
};
