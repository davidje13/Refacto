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
  useRef,
  type MutableRefObject,
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
  defaultValue: T | (() => T),
  persist = false,
): [T, (v: T) => void] {
  const id = identifier ? `${identifier}:${subIdentifier}` : undefined;
  const defaultValueRef = useRef<DefaultValueRef<T>>();
  const state = useContext(StateMapContext);
  const [value, setValue] = useState(() =>
    readStored(state, id, persist, defaultValueRef, defaultValue),
  );

  useEffect(() => {
    if (id) {
      setValue(readStored(state, id, persist, defaultValueRef, defaultValue));
    }
  }, [state, id, persist]);

  useEffect(() => {
    if (id && value[1]) {
      const v = value[0];
      state.map.set(id, v);
      if (persist && state.scope) {
        if (v !== null && v !== undefined) {
          sessionStore.setItem(`${state.scope}:${id}`, JSON.stringify(v));
        } else {
          sessionStore.removeItem(`${state.scope}:${id}`);
        }
      }
    }
  }, [id, value, persist]);

  const setter = useCallback((v: T) => setValue([v, true]), []);
  return [value[0], setter];
}

interface DefaultValueRef<T> {
  id: string | undefined;
  value: T;
}

function readStored<T>(
  state: StateMap,
  id: string | undefined,
  persist: boolean,
  defaultValueRef: MutableRefObject<DefaultValueRef<T> | undefined>,
  defaultValue: T | (() => T),
): [T, boolean] {
  if (id) {
    if (state.map.has(id)) {
      return [state.map.get(id) as T, false];
    }
    if (persist && state.scope) {
      const stored = sessionStore.getItem(`${state.scope}:${id}`);
      if (stored !== null) {
        return [JSON.parse(stored) as T, false];
      }
    }
  }
  if (typeof defaultValue !== 'function') {
    return [defaultValue, false];
  }

  if (defaultValueRef.current && defaultValueRef.current.id === id) {
    return [defaultValueRef.current.value, true];
  }

  const value = (defaultValue as () => T)();
  defaultValueRef.current = { id, value };
  return [value, true];
}
