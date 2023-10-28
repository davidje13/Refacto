import { useCallback, useState } from 'react';
import { useIsBefore } from 'react-hook-final-countdown';
import { useBoxed } from './useBoxed';

type TemporaryT = [() => boolean, boolean];

export function useTemporary(delay: number): TemporaryT {
  const [activatedTime, setActivatedTime] = useState(Number.NEGATIVE_INFINITY);
  const activated = useIsBefore(activatedTime + delay);
  const boxedActivated = useBoxed(activated);
  const invoke = useCallback(() => {
    if (boxedActivated.current) {
      return false;
    }
    if (delay > 0) {
      setActivatedTime(Date.now());
    }
    return true;
  }, [boxedActivated]);

  return [invoke, activated];
}
