import { useEffect, useState } from 'react';

export const useLocationHash = () => {
  const [hash, setHash] = useState(document.location.hash);
  useEffect(() => {
    const update = () => setHash(document.location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return hash;
};
