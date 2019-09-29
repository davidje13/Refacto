import { RetroArchive } from 'refacto-entities';
import useObservable, { ObservableState } from '../useObservable';
import { archiveTracker } from '../../api/api';

export default function useArchiveList(
  retroId: string | null,
  retroToken: string | null,
): ObservableState<RetroArchive[]> {
  const [archiveListState, error] = useObservable(
    () => {
      if (!retroId || !retroToken) {
        return undefined;
      }
      return archiveTracker.getList(retroId, retroToken);
    },
    [archiveTracker, retroId, retroToken],
  );

  return [
    archiveListState ? archiveListState.archives : null, // TODO TypeScript#16
    error,
  ];
}
