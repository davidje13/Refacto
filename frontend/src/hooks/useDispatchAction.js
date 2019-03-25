import { useMemo } from 'react';

export default function useDispatchAction(dispatch, action) {
  return useMemo(
    () => (dispatch && action && ((...args) => dispatch(action(...args)))),
    [dispatch, action],
  );
}
