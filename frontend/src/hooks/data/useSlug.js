import { useState, useLayoutEffect } from 'react';
import useNonce from '../useNonce';
import { slugTracker } from '../../api/api';

export default function useSlug(slug) {
  const [retroId, setRetroId] = useState([null, null]);
  const nonce = useNonce();

  useLayoutEffect(() => {
    const myNonce = nonce.next();

    setRetroId([null, null]);
    if (!slug) {
      return undefined;
    }

    const subscription = slugTracker.subscribe(
      slug,
      (data) => nonce.check(myNonce) && setRetroId([data, null]),
      (error) => nonce.check(myNonce) && setRetroId([null, error]),
    );
    return () => subscription.unsubscribe();
  }, [slugTracker, setRetroId, slug, nonce]);

  return retroId;
}
