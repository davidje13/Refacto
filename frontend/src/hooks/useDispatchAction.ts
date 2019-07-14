import { useMemo } from 'react';

function useDispatchAction<SpecT, A extends any[]>(
  dispatch: (spec: SpecT) => void,
  action: (...args: A) => (SpecT | undefined),
): (...args: A) => void;

function useDispatchAction<SpecT, A extends any[]>(
  dispatch: ((spec: SpecT) => void) | undefined,
  action: ((...args: A) => (SpecT | undefined)) | undefined,
): ((...args: A) => void) | undefined;

function useDispatchAction<SpecT, A extends any[]>(
  dispatch: ((spec: SpecT) => void) | undefined,
  action: ((...args: A) => (SpecT | undefined)) | undefined,
): ((...args: A) => void) | undefined {
  return useMemo(
    () => (dispatch && action && ((...args: A): void => {
      const act = action(...args);
      if (act) {
        dispatch(act);
      }
    })),
    [dispatch, action],
  );
}

export default useDispatchAction;
