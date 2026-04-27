import useAwaited from 'react-hook-awaited';
import type { RetroArchive } from '@refacto/shared/api-entities';
import { archiveService } from '../../api/api';

export function useArchiveList(
  retroId: string | null,
  retroToken: string | null,
): [RetroArchive[] | null, string | null] {
  const r = useAwaited(
    (signal) =>
      retroId && retroToken
        ? archiveService.getList(retroId, retroToken, signal)
        : null,
    [retroId, retroToken],
  );
  if (r.state === 'resolved') {
    return [r.data?.archives ?? null, null];
  }
  if (r.state === 'rejected') {
    return [null, String(r.error)];
  }
  return [null, null];
}
