import { RetroArchive } from 'refacto-entities';
import useObservable, { ObservableState } from '../useObservable';
import { archiveTracker } from '../../api/api';

export default function useArchive(
  retroId: string | null,
  archiveId: string | null,
  retroToken: string | null,
): ObservableState<RetroArchive> {
  return useObservable<RetroArchive>(
    () => {
      if (!retroId || !archiveId || !retroToken) {
        return undefined;
      }
      return archiveTracker.get(retroId, archiveId, retroToken);
    },
    [archiveTracker, retroId, archiveId, retroToken],
  );
}
