import { useState, useLayoutEffect } from 'react';
import useNonce from '../useNonce';

export default function useArchive(retroState, archiveId) {
  const [archive, setArchive] = useState(null);
  const nonce = useNonce();
  const archiveTracker = retroState?.archiveTracker;

  useLayoutEffect(() => {
    const myNonce = nonce.next();

    setArchive(null);
    if (!archiveTracker) {
      return;
    }

    archiveTracker.load(
      archiveId,
      (data) => nonce.check(myNonce) && setArchive(data),
    );
  }, [archiveTracker, setArchive, archiveId, nonce]);

  return archive;
}
