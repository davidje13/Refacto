import { useCallback, useEffect, useRef, useState } from 'react';
import { useLiveEvents, useLiveEventDispatch } from './useLiveEvents';
import { useIsAfter } from 'react-hook-final-countdown';
import { randomUUID } from '../helpers/crypto';

const myID = randomUUID();
const EVENT_DEBOUNCE = 1000;
const EVENT_EXPIRY = 10000;

export const useTypingEvent = (prefix: string) => {
  const events = useLiveEvents(prefix);
  const dispatchEvent = useLiveEventDispatch();

  const [meTyping, setMeTyping] = useState(false);
  const [others, setOthers] = useState<number[]>([]);
  const nextExpiry = Math.min(...others);
  const expired = useIsAfter(nextExpiry) ? nextExpiry : 0;

  const latestNotification = useRef(0);
  const meTypingEvent = `${prefix}${myID}`;

  const onChange = useCallback(
    (newValue: string) => {
      const previous = latestNotification.current;
      if (!newValue.trim()) {
        if (previous) {
          setMeTyping(false);
          dispatchEvent?.([meTypingEvent, null]);
          latestNotification.current = 0;
        }
        return;
      }
      const now = Date.now();
      if (!previous) {
        setMeTyping(true);
      }
      if (!previous || now > previous + EVENT_DEBOUNCE) {
        dispatchEvent?.([meTypingEvent, now]);
        latestNotification.current = now;
      }
    },
    [dispatchEvent, meTypingEvent],
  );

  useEffect(() => {
    if (expired) {
      setOthers((current) => current.filter((expire) => expire > expired));
    }
  }, [expired]);

  useEffect(() => {
    const now = Date.now();
    const others: number[] = [];
    for (const [id, details] of events) {
      const expire = asNum(details[0]) + EVENT_EXPIRY;
      if (id !== meTypingEvent && expire > now) {
        others.push(expire);
      }
    }
    setOthers(others);
  }, [events, meTypingEvent]);

  return { other: others.length, me: meTyping, onChange };
};

const asNum = (x: unknown) => (typeof x === 'number' ? x : 0);
