import { type RetroArchive } from '../../shared/api-entities';
import { useObservable, ObservableState } from '../useObservable';
import { archiveTracker } from '../../api/api';

export function useArchive(
  retroId: string | null,
  archiveId: string | null,
  retroToken: string | null,
): ObservableState<RetroArchive> {
  return useObservable<RetroArchive>(() => {
    if (!retroId || !archiveId || !retroToken) {
      return undefined;
    }
    return archiveTracker.get(retroId, archiveId, retroToken);
  }, [archiveTracker, retroId, archiveId, retroToken]);
}
