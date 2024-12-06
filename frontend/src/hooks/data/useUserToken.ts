import { userTokenTracker } from '../../api/api';
import { useAsyncValue } from '../useAsyncValue';

export const useUserToken = () => useAsyncValue(userTokenTracker)[0];
