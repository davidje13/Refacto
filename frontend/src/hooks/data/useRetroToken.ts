import { retroTokenTracker } from '../../api/api';
import { useAsyncValue } from '../useAsyncValue';

export const useRetroToken = (retroId: string | null) =>
  useAsyncValue(retroId ? retroTokenTracker.get(retroId) : undefined)[0];
