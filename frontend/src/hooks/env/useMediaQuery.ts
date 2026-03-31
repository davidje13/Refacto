import { useEffect, useMemo, useState } from 'react';

export const useMediaQuery = (query: string) => {
  const matcher = useMemo(() => matchMedia?.(query), [query]);
  const [matches, setMatches] = useState(matcher?.matches ?? false);
  useEffect(() => {
    if (!matcher) {
      return;
    }
    const update = () => setMatches(matcher.matches);
    matcher.addEventListener('change', update);
    return () => matcher.removeEventListener('change', update);
  }, [matcher]);

  return matches;
};
