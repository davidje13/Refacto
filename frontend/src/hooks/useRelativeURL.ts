import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export const useRelativeURL = () => {
  const [location] = useLocation();
  const [hash, setHash] = useState(document.location.hash);
  useEffect(() => {
    const update = () => setHash(document.location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return hash.length > 1 ? location + hash : location;
};
