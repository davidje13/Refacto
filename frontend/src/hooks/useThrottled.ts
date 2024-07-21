import { useState } from 'react';
import { useIsBefore } from 'react-hook-final-countdown';
import { useEvent } from './useEvent';

type Fn<Args extends any[], Return> = (...args: Args) => Return;

export function useThrottled<Args extends any[], Return>(
  fn: Fn<Args, Return>,
  delay: number,
): [Fn<Args, Return | undefined>, boolean];

export function useThrottled<Args extends any[], Return>(
  fn: Fn<Args, Return> | undefined,
  delay: number,
): [Fn<Args, Return | undefined> | undefined, boolean];

export function useThrottled<Args extends any[], Return>(
  fn: Fn<Args, Return> | undefined,
  delay: number,
): [Fn<Args, Return | undefined> | undefined, boolean] {
  const [activatedTime, setActivatedTime] = useState(Number.NEGATIVE_INFINITY);
  const activated = useIsBefore(activatedTime + delay);
  const invoke = useEvent((...args: Args) => {
    if (activated) {
      return undefined;
    }
    if (delay > 0) {
      setActivatedTime(Date.now());
    }
    return fn?.(...args);
  });

  return [fn && invoke, activated];
}
