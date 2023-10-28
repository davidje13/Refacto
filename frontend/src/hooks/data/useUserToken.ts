import { useObservable, ObservableState } from '../useObservable';
import { userTokenTracker } from '../../api/api';

export function useUserToken(): ObservableState<string> {
  return useObservable(() => userTokenTracker.get(), [userTokenTracker]);
}
