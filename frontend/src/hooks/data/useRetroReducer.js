import { useState, useLayoutEffect } from 'react';
import useNonce from '../useNonce';
import { retroTracker } from '../../api/api';

export default function useRetroReducer(retroId) {
  const [retro, setRetro] = useState(null);
  const [retroDispatch, setRetroDispatch] = useState(null);
  const nonce = useNonce();

  useLayoutEffect(() => {
    const myNonce = nonce.next();

    setRetro(null);
    if (!retroId) {
      return undefined;
    }

    const subscription = retroTracker.subscribe(
      retroId,
      (dispatch) => nonce.check(myNonce) && setRetroDispatch(() => dispatch),
      (data) => nonce.check(myNonce) && setRetro(data),
    );
    return () => subscription.unsubscribe();
  }, [retroTracker, setRetro, setRetroDispatch, retroId]);

  return [retro, retroDispatch];
}
