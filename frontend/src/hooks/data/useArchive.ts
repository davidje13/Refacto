import { type RetroArchive } from '../../shared/api-entities';
import { archiveService } from '../../api/api';
import useAwaited from 'react-hook-awaited';

export function useArchive(
  retroId: string | null,
  archiveId: string | null,
  retroToken: string | null,
): [RetroArchive | null, string | null] {
  const r = useAwaited(
    (signal) =>
      retroId && archiveId && retroToken
        ? archiveService.get(retroId, archiveId, retroToken, signal)
        : null,
    [retroId, archiveId, retroToken],
  );
  if (r.state === 'resolved') {
    return [r.data, null];
  }
  if (r.state === 'rejected') {
    return [null, String(r.error)];
  }
  return [null, null];
}
