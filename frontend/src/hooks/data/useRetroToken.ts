import useObservable, { ObservableState } from '../useObservable';
import { retroTokenTracker } from '../../api/api';

export default function useRetroToken(
  retroId: string | null,
): ObservableState<string> {
  return useObservable(
    () => {
      if (!retroId) {
        return undefined;
      }
      return retroTokenTracker.get(retroId);
    },
    [retroTokenTracker, retroId],
  );
}
