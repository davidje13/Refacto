import useObservable from '../useObservable';
import { userTokenTracker } from '../../api/api';

export default function useUserToken() {
  return useObservable(
    () => userTokenTracker.get(),
    [userTokenTracker],
  );
}
