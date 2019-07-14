import useObservable, { ObservableState } from '../useObservable';
import { retroListTracker } from '../../api/api';
import RetroSummary from '../../data/RetroSummary';

export default function useRetroList(
  userToken: string | null,
): ObservableState<RetroSummary[]> {
  const [retroListState, error] = useObservable(
    () => userToken && retroListTracker.get(userToken),
    [retroListTracker, userToken],
  );

  return [
    retroListState ? retroListState.retros : null, // TODO TypeScript#16
    error,
  ];
}
