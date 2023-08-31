import { type RetroArchive } from '../../shared/api-entities';
import { useObservable, ObservableState } from '../useObservable';
import { archiveTracker } from '../../api/api';

export function useArchiveList(
  retroId: string | null,
  retroToken: string | null,
): ObservableState<RetroArchive[]> {
  const [archiveListState, error] = useObservable(() => {
    if (!retroId || !retroToken) {
      return undefined;
    }
    return archiveTracker.getList(retroId, retroToken);
  }, [archiveTracker, retroId, retroToken]);

  return [archiveListState?.archives ?? null, error];
}
