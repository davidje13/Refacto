import type { DispatchSpec } from 'shared-reducer-frontend';
import { useMemo } from 'react';

type Action<A extends any[]> = (...args: A) => void;

export default <T>(
  dispatch: ((spec: DispatchSpec<T>) => void) | undefined,
  condition = true,
) => <A extends any[]>(
  action: ((...args: A) => DispatchSpec<T>) | undefined,
  ...followupActions: DispatchSpec<T>
): Action<A> | undefined => useMemo(
  () => ((dispatch && action && condition) ? (
    (...args: A): void => dispatch([...action(...args), ...followupActions])
  ) : undefined),
  [dispatch, action, condition, ...followupActions],
);
