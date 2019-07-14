import useObservable from '../useObservable';
import { archiveTracker } from '../../api/api';

export default function useArchiveList(retroId, retroToken) {
  const [archiveListState, error] = useObservable(
    () => {
      if (!retroId || !retroToken) {
        return null;
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
