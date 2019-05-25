import useObservable from '../useObservable';

export default function useArchiveList(retroState) {
  const archiveTracker = retroState?.archiveTracker;

  return useObservable(
    () => archiveTracker?.getList(),
    [archiveTracker],
  );
}
