import useObservable from '../useObservable';

export default function useArchive(retroState, archiveId) {
  const archiveTracker = retroState?.archiveTracker;

  return useObservable(
    () => (archiveId && archiveTracker?.get(archiveId)),
    [archiveTracker, archiveId],
  );
}
