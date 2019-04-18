import useObservable from '../useObservable';
import { retroTokenTracker } from '../../api/api';

export default function useRetroToken(retroId) {
  return useObservable(
    () => (retroId && retroTokenTracker.get(retroId)),
    [retroTokenTracker, retroId],
  );
}
