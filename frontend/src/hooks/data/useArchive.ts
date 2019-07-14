import useObservable, { ObservableState } from '../useObservable';
import { archiveTracker } from '../../api/api';
import RetroArchive from '../../data/RetroArchive';

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
