import { type DispatchSpec } from 'shared-reducer-frontend';
import { useMemo } from 'react';

type Action<A extends readonly unknown[]> = (...args: A) => void;

export const useActionFactory =
  <T, SpecT>(
    dispatch: ((spec: DispatchSpec<T, SpecT>) => void) | undefined,
    condition = true,
  ) =>
  <A extends readonly unknown[]>(
    action: ((...args: A) => DispatchSpec<T, SpecT>) | undefined,
    ...followupActions: DispatchSpec<T, SpecT>
  ): Action<A> | undefined =>
    useMemo(
      () =>
        dispatch && action && condition
          ? (...args: A): void =>
              dispatch([...action(...args), ...followupActions])
          : undefined,
      [dispatch, action, condition, ...followupActions],
    );
