import { type RetroSummary } from '../../shared/api-entities';
import { useObservable, ObservableState } from '../useObservable';
import { retroListTracker } from '../../api/api';

export function useRetroList(
  userToken: string | null,
): ObservableState<RetroSummary[]> {
  const [retroListState, error] = useObservable(() => {
    if (!userToken) {
      return undefined;
    }
    return retroListTracker.get(userToken);
  }, [retroListTracker, userToken]);

  return [retroListState?.retros ?? null, error];
}
