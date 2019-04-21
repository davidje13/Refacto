import useObservable from '../useObservable';
import { retroListTracker } from '../../api/api';

export default function useRetroList(userToken) {
  return useObservable(
    () => userToken && retroListTracker.get(userToken),
    [retroListTracker, userToken],
  );
}
