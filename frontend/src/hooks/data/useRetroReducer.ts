import { useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import type { Retro, RetroAuth } from '../../shared/api-entities';
import type { RetroDispatch } from '../../api/RetroTracker';
import { retroTracker } from '../../api/api';

const MAX_EVENT_MEMORY = 512;

export function useRetroReducer(
  retroId: string | null,
  retroAuth: RetroAuth | null,
  reauthenticateCallback: (
    retroId: string,
    signal: AbortSignal,
  ) => Promise<boolean> | void,
): RetroReducerState {
  const [retroState, setRetroState] = useState<RetroState | null>(null);
  const [status, setStatus] = useState<RetroReducerStatus>('init');
  const [retroDispatch, setRetroDispatch] = useState<RetroDispatch | null>(
    null,
  );

  // This cannot be useEffect; the websocket would be closed & reopened
  // when switching between pages within the retro
  useLayoutEffect(() => {
    const ac = new AbortController();
    setRetroState(null);
    setRetroDispatch(null);
    if (!retroId || !retroAuth) {
      return undefined;
    }

    const subscription = retroTracker.subscribe(
      retroId,
      retroAuth.retroToken,
      (data, events) => {
        const setter = (oldState: RetroState | null): RetroState => {
          let newEvents = oldState?.events;
          if (events.length > 0) {
            newEvents = new Map(newEvents);
            for (const [id, ...details] of events) {
              newEvents.delete(id);
              if (newEvents.size > MAX_EVENT_MEMORY) {
                newEvents.delete(newEvents.keys().next().value!);
              }
              newEvents.set(id, details);
            }
          }
          return { retro: data, events: newEvents ?? new Map() };
        };
        const animation = events.some(([evt]) => evt === 'archive')
          ? 'archive'
          : null;
        if (animation && document.startViewTransition) {
          const viewTransition = document.startViewTransition({
            update: () => flushSync(() => setRetroState(setter)),
            types: [animation],
          });
          viewTransition.ready.catch(() => {}); // ignore errors (e.g. 'Skipped ViewTransition due to document being hidden')
        } else {
          setRetroState(setter);
        }
      },
      (status) => setStatus(status ? 'connected' : 'reconnecting'),
      async () => {
        const success = await reauthenticateCallback(retroId, ac.signal);
        if (success === false) {
          setStatus('reauthenticate');
        }
      },
    );
    setRetroDispatch(() => subscription.dispatch);

    return () => {
      ac.abort();
      subscription.unsubscribe();
    };
  }, [retroId, retroAuth, reauthenticateCallback]);

  return [retroState, retroDispatch, status];
}

export type RetroReducerStatus =
  | 'init'
  | 'connected'
  | 'reconnecting'
  | 'reauthenticate';

interface RetroState {
  retro: Retro;
  events: Map<string, unknown[]>;
}

type RetroReducerState = [
  RetroState | null,
  RetroDispatch | null,
  RetroReducerStatus,
];
