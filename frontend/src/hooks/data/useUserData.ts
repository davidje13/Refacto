import { userDataTracker } from '../../api/api';
import { useAsyncValue } from '../useAsyncValue';

export const useUserData = () => useAsyncValue(userDataTracker)[0];
