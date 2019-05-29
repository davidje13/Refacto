import useObservable from '../useObservable';
import { archiveTracker } from '../../api/api';

export default function useArchive(retroId, archiveId, retroToken) {
  return useObservable(
    () => {
      if (!retroId || !archiveId || !retroToken) {
        return null;
      }
      return archiveTracker.get(retroId, archiveId, retroToken);
    },
    [archiveTracker, retroId, archiveId, retroToken],
  );
}
