type Mapper<T> = (v: unknown) => T;

type ObjectMapper<T> = {
  [K in keyof T]: Mapper<T[K]>;
};

function isJsonObject(source: unknown): source is Record<string, unknown> {
  return Boolean(source && typeof source === 'object');
}

const jsonObject =
  <T>(maps: ObjectMapper<T>) =>
  (source: unknown): T => {
    if (!isJsonObject(source)) {
      throw new Error('Expected object');
    }
    const result = {} as T;
    Object.keys(maps).forEach((k) => {
      const key = k as keyof T;
      result[key] = maps[key](source[k]);
    });
    return result;
  };

const jsonAny = (source: unknown): unknown => source;

export const json = {
  nullable:
    <T>(submap: Mapper<T>) =>
    (source: unknown): T | null => {
      if (source === null) {
        return null;
      }
      return submap(source);
    },

  optional:
    <T>(submap: Mapper<T>) =>
    (source: unknown): T | undefined => {
      if (source === undefined) {
        return undefined;
      }
      return submap(source);
    },

  oneOf:
    <Ts extends unknown[]>(...options: ObjectMapper<Ts>) =>
    (source: unknown): Ts[number] => {
      let err: unknown = new Error('No matching type');
      for (const option of options) {
        try {
          return option(source);
        } catch (e) {
          err = e;
        }
      }
      throw err;
    },

  any: jsonAny,

  object: jsonObject,

  exactObject: <T>(maps: ObjectMapper<T>): Mapper<T> => {
    const subExtract = jsonObject(maps);
    const knownKeys = new Set(Object.keys(maps));

    return (source: unknown): T => {
      const result = subExtract(source);
      const extraKey = Object.keys(source as Record<string, unknown>).find(
        (k) => !knownKeys.has(k),
      );
      if (extraKey) {
        throw new Error(`Unexpected property ${extraKey}`);
      }
      return result;
    };
  },

  record:
    <V>(valueMap: Mapper<V>) =>
    (source: unknown): Record<string, V> => {
      if (!isJsonObject(source)) {
        throw new Error('Expected object');
      }
      if (valueMap === jsonAny) {
        return source as Record<string, V>;
      }
      const mapped: Record<string, V> = {};
      Object.entries(source).forEach(([key, value]) => {
        if (key in mapped) {
          Object.defineProperty(mapped, key, {
            value,
            enumerable: true,
            configurable: true,
            writable: true,
          });
        } else {
          mapped[key] = valueMap(value);
        }
      });
      return mapped;
    },

  array:
    <T>(map: Mapper<T>) =>
    (source: unknown): T[] => {
      if (!Array.isArray(source)) {
        throw new Error('Expected array');
      }
      if (map === jsonAny) {
        return source as T[];
      }
      return Array.prototype.map.call(source, map) as T[];
    },

  string: (source: unknown): string => {
    if (typeof source !== 'string') {
      throw new Error('Expected string');
    }
    return source;
  },

  number: (source: unknown): number => {
    if (typeof source !== 'number') {
      throw new Error('Expected number');
    }
    return source;
  },

  boolean: (source: unknown): boolean => {
    if (typeof source !== 'boolean') {
      throw new Error('Expected boolean');
    }
    return source;
  },

  extractObject: <T>(source: unknown, maps: ObjectMapper<T>): T =>
    jsonObject(maps)(source),
  parse: <T>(source: string, map: Mapper<T>): T => map(JSON.parse(source)),
};
