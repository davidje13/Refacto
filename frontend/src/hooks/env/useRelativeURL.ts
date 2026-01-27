import { useLocation } from 'wouter';
import { useLocationHash } from './useLocationHash';

export const useRelativeURL = () => {
  const [location] = useLocation();
  const hash = useLocationHash();
  return hash.length > 1 ? location + hash : location;
};
