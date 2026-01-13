import type { RetroSummary, UserData } from '../../shared/api-entities';
import { retroListTracker } from '../../api/api';
import useAwaited from 'react-hook-awaited';

export function useRetroList(
  userData: UserData | null,
): [RetroSummary[] | null, string | null] {
  const r = useAwaited(
    (signal) =>
      userData ? retroListTracker.get(userData.userToken, signal) : null,
    [userData],
  );
  if (r.state === 'resolved') {
    return [r.data?.retros ?? null, null];
  }
  if (r.state === 'rejected') {
    return [null, String(r.error)];
  }
  return [null, null];
}
