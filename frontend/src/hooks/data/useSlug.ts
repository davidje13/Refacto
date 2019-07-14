import useObservable, { ObservableState } from '../useObservable';
import { slugTracker } from '../../api/api';

export default function useSlug(
  slug: string | null,
): ObservableState<string> {
  return useObservable(
    () => {
      if (!slug) {
        return undefined;
      }
      return slugTracker.get(slug);
    },
    [slugTracker, slug],
  );
}
