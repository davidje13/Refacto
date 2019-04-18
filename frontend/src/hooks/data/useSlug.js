import useObservable from '../useObservable';
import { slugTracker } from '../../api/api';

export default function useSlug(slug) {
  return useObservable(
    () => (slug && slugTracker.get(slug)),
    [slugTracker, slug],
  );
}
