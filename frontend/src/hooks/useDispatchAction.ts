import { useMemo } from 'react';

function useDispatchAction<SpecT, A extends any[]>(
  dispatch: (spec: SpecT) => void,
  action: (...args: A) => SpecT,
  ...followupActions: SpecT[]
): (...args: A) => void;

function useDispatchAction<SpecT, A extends any[]>(
  dispatch: ((spec: SpecT) => void) | undefined,
  action: ((...args: A) => SpecT) | undefined,
  ...followupActions: SpecT[]
): ((...args: A) => void) | undefined;

function useDispatchAction<SpecT, A extends any[]>(
  dispatch: ((spec: SpecT) => void) | undefined,
  action: ((...args: A) => SpecT) | undefined,
  ...followupActions: SpecT[]
): ((...args: A) => void) | undefined {
  return useMemo(
    () => (dispatch && action && ((...args: A): void => {
      dispatch(action(...args));
      followupActions.forEach(dispatch);
    })),
    [dispatch, action, ...followupActions],
  );
}

export default useDispatchAction;
