import { useSyncExternalStore } from 'react';
import { AsyncValue } from '../helpers/AsyncValue';

export function useAsyncValue<T, Err>(
  asyncValue: AsyncValue<T, Err> | undefined,
) {
  const tracked = asyncValue ?? AsyncValue.EMPTY;
  return useSyncExternalStore(tracked.subscribe, tracked.peekState);
}
