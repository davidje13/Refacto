import type { RetroSummary } from 'refacto-entities';
import useObservable, { ObservableState } from '../useObservable';
import { retroListTracker } from '../../api/api';

export default function useRetroList(
  userToken: string | null,
): ObservableState<RetroSummary[]> {
  const [retroListState, error] = useObservable(
    () => {
      if (!userToken) {
        return undefined;
      }
      return retroListTracker.get(userToken);
    },
    [retroListTracker, userToken],
  );

  return [
    retroListState?.retros ?? null,
    error,
  ];
}
