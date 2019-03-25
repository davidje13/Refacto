import { useState, useLayoutEffect } from 'react';
import useNonce from '../useNonce';
import { slugTracker } from '../../api/api';

export default function useSlug(slug) {
  const [slugData, setSlugData] = useState(null);
  const nonce = useNonce();

  useLayoutEffect(() => {
    const myNonce = nonce.next();

    setSlugData(null);
    if (!slug) {
      return;
    }

    slugTracker.load(
      slug,
      (data) => nonce.check(myNonce) && setSlugData(data),
    );
  }, [slugTracker, setSlugData, slug, nonce]);

  return slugData;
}
