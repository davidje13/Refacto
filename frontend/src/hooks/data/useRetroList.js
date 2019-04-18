import useObservable from '../useObservable';
import { retroListTracker } from '../../api/api';

export default function useRetroList() {
  return useObservable(
    () => retroListTracker.get(),
    [retroListTracker],
  );
}
