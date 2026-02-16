import {
  createContext,
  type ReactNode,
  type ReactElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { sessionStore } from '../helpers/storage';

interface StateMap {
  map: Map<string, unknown>;
  scope: string;
}

const StateMapContext = createContext<StateMap>({ map: new Map(), scope: '' });

interface StateMapProviderProps {
  children: ReactNode;
  scope: string;
}

export function StateMapProvider({
  children,
  scope,
}: StateMapProviderProps): ReactElement {
  const [state, setState] = useState<StateMap>(() => ({
    map: new Map<string, unknown>(),
    scope,
  }));
  const latestScope = state.scope;
  useLayoutEffect(() => {
    if (scope !== latestScope) {
      setState({ map: new Map<string, unknown>(), scope });
    }
  }, [scope, latestScope]);

  return (
    <StateMapContext.Provider value={state}>
      {children}
    </StateMapContext.Provider>
  );
}

interface StaticStateMapProviderProps {
  children: ReactNode;
  data: Map<string, unknown>;
}

export const StaticStateMapProvider = ({
  children,
  data,
}: StaticStateMapProviderProps) => {
  const wrapped = useMemo(() => ({ map: data, scope: '' }), [data]);
  return (
    <StateMapContext.Provider value={wrapped}>
      {children}
    </StateMapContext.Provider>
  );
};

export function useStateMap<T>(
  identifier: string | undefined,
  subIdentifier: string,
  defaultValue: T,
  persist = false,
): [T, (v: T) => void] {
  const id = identifier ? `${identifier}:${subIdentifier}` : undefined;
  const state = useContext(StateMapContext);
  const [value, setValue] = useState<T>(() =>
    readStored(state, id, persist, defaultValue),
  );

  useEffect(() => {
    if (id) {
      setValue(readStored(state, id, persist, defaultValue));
    }
  }, [state, id, persist]);

  const setter = useCallback(
    (v: T) => {
      if (id) {
        state.map.set(id, v);
        if (persist && state.scope) {
          if (v !== null && v !== undefined) {
            sessionStore.setItem(`${state.scope}:${id}`, JSON.stringify(v));
          } else {
            sessionStore.removeItem(`${state.scope}:${id}`);
          }
        }
      }
      setValue(v);
    },
    [state, id, persist],
  );
  return [value, setter];
}

function readStored<T>(
  state: StateMap,
  id: string | undefined,
  persist: boolean,
  defaultValue: T,
): T {
  if (!id) {
    return defaultValue;
  }
  if (state.map.has(id)) {
    return state.map.get(id) as T;
  }
  if (persist && state.scope) {
    const stored = sessionStore.getItem(`${state.scope}:${id}`);
    if (stored !== null) {
      return JSON.parse(stored) as T;
    }
  }
  return defaultValue;
}
