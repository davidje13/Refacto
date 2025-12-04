import { useEvent } from './useEvent';

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
