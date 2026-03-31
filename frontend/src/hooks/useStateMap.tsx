import {
  createContext,
  type ReactNode,
  type ReactElement,
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { sessionStore } from '../helpers/storage';
import { useEvent } from './useEvent';

const StateMapContext = createContext<StateMap | null>(null);

interface StateMapProviderProps {
  children: ReactNode;
  scope: string;
  persist?: string | undefined;
}

export function StateMapProvider({
  children,
  scope,
  persist,
}: StateMapProviderProps): ReactElement {
  const [state, setState] = useState(() => stateMap(scope, persist));
  const latestScope = state.scope;
  const latestPersist = state.persist;
  useLayoutEffect(() => {
    if (scope !== latestScope || persist !== latestPersist) {
      setState(stateMap(scope, persist));
    }
  }, [scope, persist, latestScope, latestPersist]);

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
  const [defaults] = useState(() => new Map<string, any>());
  const wrapped = useMemo<StateMap>(
    () => staticStateMap(data, defaults),
    [data, defaults],
  );
  return (
    <StateMapContext.Provider value={wrapped}>
      {children}
    </StateMapContext.Provider>
  );
};

export function useStateMap<T>(
  id: string | undefined,
  defaultValue: T | (() => T),
  usePersisted = false,
): [T, (v: T) => void] {
  const state = useContext(StateMapContext);
  const [local, setLocal] = useState(() =>
    id && state
      ? state.get(id, defaultValue, usePersisted)
      : applyDefault(defaultValue),
  );

  const config = useRef({ d: defaultValue, p: usePersisted });
  useLayoutEffect(() => {
    config.current = { d: defaultValue, p: usePersisted };
  }, [defaultValue, usePersisted]);
  useEffect(() => {
    if (id && state) {
      setLocal(state.get(id, config.current.d, config.current.p));
    } else {
      setLocal(applyDefault(config.current.d));
    }
  }, [id, state]);

  const setter = useEvent((v: T) => {
    if (id && state) {
      state.set(id, v, usePersisted);
    }
    setLocal(v);
  });

  return [local, setter];
}

interface StateMap {
  get<T>(id: string, defaultValue: T | (() => T), usePersisted: boolean): T;
  set<T>(id: string, value: T, usePersisted: boolean): void;
}

function stateMap(
  scope: string,
  persist: string | undefined,
): StateMap & { scope: string; persist: string | undefined } {
  const data = new Map<string, any>();
  if (persist) {
    const save = (key: string, v: unknown) => {
      if (v !== null && v !== undefined) {
        sessionStore.setItem(key, JSON.stringify({ p: persist, v }));
      } else {
        sessionStore.removeItem(key);
      }
    };
    return {
      get: (id, defaultValue, usePersisted) => {
        const key = `${scope}:${id}`;
        if (data.has(id)) {
          return data.get(id);
        }
        if (usePersisted) {
          try {
            const stored = JSON.parse(sessionStore.getItem(key) ?? 'null');
            if (
              stored &&
              typeof stored === 'object' &&
              'v' in stored &&
              stored.p === persist
            ) {
              data.set(id, stored.v);
              return stored.v;
            }
          } catch {}
        }
        const v = applyDefault(defaultValue);
        data.set(id, v);
        if (usePersisted) {
          save(key, v);
        }
        return v;
      },
      set: (id, v, usePersisted) => {
        data.set(id, v);
        if (usePersisted) {
          save(`${scope}:${id}`, v);
        }
      },
      scope,
      persist,
    };
  } else {
    return {
      get: (id, defaultValue) => {
        if (!data.has(id)) {
          data.set(id, applyDefault(defaultValue));
        }
        return data.get(id);
      },
      set: (id, v) => data.set(id, v),
      scope,
      persist,
    };
  }
}

function staticStateMap(
  data: Map<string, any>,
  defaults: Map<string, any>,
): StateMap {
  return {
    get: (id, defaultValue) => {
      if (data.has(id)) {
        return data.get(id);
      }
      if (!defaults.has(id)) {
        defaults.set(id, applyDefault(defaultValue));
      }
      return defaults.get(id);
    },
    set: () => {},
  };
}

const applyDefault = <T extends unknown>(valueOrFn: T | (() => T)): T =>
  typeof valueOrFn === 'function' ? (valueOrFn as () => T)() : valueOrFn;
