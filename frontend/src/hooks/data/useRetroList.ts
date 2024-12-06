import { type RetroSummary } from '../../shared/api-entities';
import { retroListTracker } from '../../api/api';
import useAwaited from 'react-hook-awaited';

export function useRetroList(
  userToken: string | null,
): [RetroSummary[] | null, string | null] {
  const r = useAwaited(
    (signal) => (userToken ? retroListTracker.get(userToken, signal) : null),
    [userToken],
  );
  if (r.state === 'resolved') {
    return [r.data?.retros ?? null, null];
  }
  if (r.state === 'rejected') {
    return [null, String(r.error)];
  }
  return [null, null];
}
