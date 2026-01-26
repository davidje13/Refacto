import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ChangeEvent, Dispatch } from 'shared-reducer/frontend';
import { useEvent } from './useEvent';

interface LiveEventsState {
  events: Map<string, unknown[]>;
  dispatch: Dispatch<unknown, never> | null;
}

const LiveEventsContext = createContext<LiveEventsState>({
  events: new Map<string, unknown[]>(),
  dispatch: null,
});

interface LiveEventsProviderProps {
  children: ReactNode;
  events: Map<string, unknown[]>;
  dispatch: Dispatch<unknown, never> | null;
}

export const LiveEventsProvider = ({
  children,
  events,
  dispatch,
}: LiveEventsProviderProps) => (
  <LiveEventsContext.Provider
    value={useMemo(() => ({ events, dispatch }), [events, dispatch])}
  >
    {children}
  </LiveEventsContext.Provider>
);

export const useLiveEvents = (prefix?: string) => {
  const { events } = useContext(LiveEventsContext);
  return useMemo(() => {
    if (!prefix) {
      return events;
    }
    const r: [string, unknown[]][] = [];
    for (const [id, details] of events) {
      if (id.startsWith(prefix)) {
        r.push([id, details]);
      }
    }
    return new Map(r);
  }, [events, prefix]);
};

export const useLiveEventDispatch = () => {
  const { dispatch } = useContext(LiveEventsContext);
  const wrapped = useEvent((...events: ChangeEvent[]): void =>
    dispatch?.([], { events }),
  );
  return dispatch && wrapped;
};
