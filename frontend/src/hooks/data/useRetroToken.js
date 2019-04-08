import { useState, useLayoutEffect } from 'react';
import useNonce from '../useNonce';
import { retroTokenTracker } from '../../api/api';

export default function useRetroToken(retroId) {
  const [token, setToken] = useState(null);
  const nonce = useNonce();

  useLayoutEffect(() => {
    const myNonce = nonce.next();

    setToken(null);
    if (!retroId) {
      return undefined;
    }

    const subscription = retroTokenTracker.subscribe(
      retroId,
      (newToken) => nonce.check(myNonce) && setToken(newToken),
    );
    return () => subscription.unsubscribe();
  }, [retroTokenTracker, setToken, retroId]);

  return token;
}
