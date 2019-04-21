import { useState, useLayoutEffect } from 'react';
import useNonce from '../useNonce';
import { retroTracker } from '../../api/api';

export default function useRetroReducer(retroId, retroToken) {
  const [retro, setRetro] = useState(null);
  const [retroDispatch, setRetroDispatch] = useState(null);
  const [error, setError] = useState(null);
  const nonce = useNonce();

  useLayoutEffect(() => {
    const myNonce = nonce.next();

    setRetro(null);
    setRetroDispatch(null);
    setError(null);
    if (!retroId || !retroToken) {
      return undefined;
    }

    const subscription = retroTracker.subscribe(
      retroId,
      retroToken,
      (dispatch) => nonce.check(myNonce) && setRetroDispatch(() => dispatch),
      (data) => nonce.check(myNonce) && setRetro(data),
      (err) => nonce.check(myNonce) && setError(err),
    );
    return () => subscription.unsubscribe();
  }, [retroTracker, setRetro, setRetroDispatch, setError, retroId, retroToken]);

  return [retro, retroDispatch, error];
}
