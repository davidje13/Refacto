import { useState, useLayoutEffect } from 'react';
import useNonce from '../useNonce';
import { retroListTracker } from '../../api/api';

export default function useRetroList() {
  const [retroListData, setRetroListData] = useState(null);
  const nonce = useNonce();

  useLayoutEffect(() => {
    const myNonce = nonce.next();

    setRetroListData(null);

    retroListTracker.load(
      (data) => nonce.check(myNonce) && setRetroListData(data),
    );
  }, [retroListTracker, setRetroListData, nonce]);

  return retroListData;
}
