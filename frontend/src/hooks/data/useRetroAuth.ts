import { retroAuthTracker } from '../../api/api';
import { useAsyncValue } from '../useAsyncValue';

export const useRetroAuth = (retroId: string | null) =>
  useAsyncValue(retroId ? retroAuthTracker.get(retroId) : undefined)[0];
