import type { LocationHook, Path } from 'wouter';

// https://github.com/molefrog/wouter/issues/113

export interface StaticLocationHook extends LocationHook {
  locationHistory: Path[];
}

export default function staticLocationHook(path = '/', dynamic = false): StaticLocationHook {
  let latestLocation = path;
  const hook: StaticLocationHook = () => [
    dynamic ? latestLocation : path,
    (to: Path, replace?: boolean): void => {
      if (replace) {
        hook.locationHistory.pop();
      }
      hook.locationHistory.push(to);
      latestLocation = to;
    },
  ];
  hook.locationHistory = [path];
  return hook;
}
