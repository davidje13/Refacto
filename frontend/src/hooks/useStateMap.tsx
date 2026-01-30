import {
  createContext,
  type ReactNode,
  type ReactElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
} from 'react';

const StateMapContext = createContext(new Map<string, unknown>());

interface StateMapProviderProps {
  children: ReactNode;
  scope?: string;
}

export function StateMapProvider({
  children,
  scope,
}: StateMapProviderProps): ReactElement {
  const [[map, latestScope], set] = useState(() => [
    new Map<string, unknown>(),
    scope,
  ]);
  useLayoutEffect(() => {
    if (scope !== latestScope) {
      set([new Map<string, unknown>(), scope]);
    }
  }, [scope, latestScope]);
  return (
    <StateMapContext.Provider value={map}>{children}</StateMapContext.Provider>
  );
}

interface StaticStateMapProviderProps {
  children: ReactNode;
  data: Map<string, unknown>;
}

export const StaticStateMapProvider = ({
  children,
  data,
}: StaticStateMapProviderProps) => (
  <StateMapContext.Provider value={data}>{children}</StateMapContext.Provider>
);

export function useStateMap<T>(
  identifier: string | undefined,
  subIdentifier: string,
  defaultValue: T,
): [T, (v: T) => void] {
  const id = identifier ? `${identifier}:${subIdentifier}` : undefined;
  const map = useContext(StateMapContext);
  const [value, setValue] = useState(() => {
    if (!id) {
      return defaultValue;
    }
    return (map.get(id) || defaultValue) as T;
  });

  useEffect(() => {
    if (id) {
      setValue((map.get(id) || defaultValue) as T);
    }
  }, [map, id]);

  const setter = useCallback(
    (v: T) => {
      if (id) {
        map.set(id, v);
      }
      setValue(v);
    },
    [map, id],
  );
  return [value, setter];
}
