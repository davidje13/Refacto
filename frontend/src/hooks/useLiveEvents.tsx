import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ChangeEvent, Dispatch } from 'shared-reducer/frontend';
import { useRefed } from './useRefed';

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

export type LiveEventDispatch = ((evt: ChangeEvent) => void) & {
  nagle: (generator: () => ChangeEvent | null, delay?: number) => void;
};

export const useLiveEventDispatch = (): LiveEventDispatch | null => {
  const { dispatch } = useContext(LiveEventsContext);
  const latestDispatch = useRefed(dispatch);

  const state = useRef<
    | {
        _hold?: never;
        _tm: NodeJS.Timeout | undefined;
        _gen: () => ChangeEvent | null;
      }
    | { _hold: 1; _tm?: never; _gen?: never }
    | {
        _hold: 2;
        _tm?: never;
        _nextDelay: number;
        _gen: () => ChangeEvent | null;
      }
    | null
  >(null);

  const [wrapped] = useState(() => {
    const send = () => {
      const evt = state.current?._gen?.();
      if (!evt) {
        state.current = null;
        return;
      }
      state.current = { _hold: 1 };
      dispatch?.([], {
        events: [evt],
        syncedCallback: () => {
          if (state.current?._hold === 2) {
            state.current = {
              _tm: setTimeout(send, state.current._nextDelay),
              _gen: state.current._gen,
            };
          } else {
            state.current = null;
          }
        },
      });
    };
    const nagle = (generator: () => ChangeEvent | null, delay = 0): void => {
      if (!state.current) {
        state.current = { _tm: setTimeout(send, delay), _gen: generator };
      } else if (state.current._hold) {
        state.current = { _hold: 2, _nextDelay: delay, _gen: generator };
      }
    };
    const immediate = (evt: ChangeEvent): void => {
      if (state.current?._tm) {
        clearTimeout(state.current._tm);
      }
      state.current = null;
      latestDispatch.current?.([], { events: [evt] });
    };
    return Object.assign(immediate, { nagle });
  });

  return dispatch && wrapped;
};
