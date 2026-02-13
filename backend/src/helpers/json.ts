type Mapper<T> = (v: unknown, path?: string) => T;

type ObjectMapper<T> = {
  [K in keyof T]: Mapper<T[K]>;
};

export class ValidationError extends Error {
  constructor(message: string, path: string) {
    super(`${message} at ${path || 'root'}`);
  }
}

function isJsonObject(source: unknown): source is Record<string, unknown> {
  return Boolean(source && typeof source === 'object');
}

const jsonObject =
  <T>(maps: ObjectMapper<T>) =>
  (source: unknown, path = ''): T => {
    if (!isJsonObject(source)) {
      throw new ValidationError('Expected object', path);
    }
    const result = {} as T;
    Object.keys(maps).forEach((k) => {
      const key = k as keyof T;
      result[key] = maps[key](source[k], `${path}.${k}`);
    });
    return result;
  };

const jsonAny = (source: unknown): unknown => source;

export const json = {
  nullable:
    <T>(submap: Mapper<T>, path = '') =>
    (source: unknown): T | null => {
      if (source === null) {
        return null;
      }
      return submap(source, path);
    },

  optional:
    <T>(submap: Mapper<T>) =>
    (source: unknown, path = ''): T | undefined => {
      if (source === undefined) {
        return undefined;
      }
      return submap(source, path);
    },

  fallback:
    <T>(submap: Mapper<T>, fallback: T) =>
    (source: unknown, path = ''): T => {
      if (source === undefined) {
        return fallback;
      }
      return submap(source, path);
    },

  oneOf:
    <Ts extends unknown[]>(...options: ObjectMapper<Ts>) =>
    (source: unknown, path = ''): Ts[number] => {
      let err: unknown;
      for (const option of options) {
        try {
          return option(source, path);
        } catch (e) {
          err = e;
        }
      }
      throw err ?? new ValidationError('No matching type', path);
    },

  any: jsonAny,

  object: jsonObject,

  exactObject: <T>(maps: ObjectMapper<T>): Mapper<T> => {
    const subExtract = jsonObject(maps);
    const knownKeys = new Set(Object.keys(maps));

    return (source: unknown, path = ''): T => {
      const result = subExtract(source, path);
      const extraKey = Object.keys(source as Record<string, unknown>).find(
        (k) => !knownKeys.has(k),
      );
      if (extraKey) {
        throw new ValidationError(`Unexpected property ${extraKey}`, path);
      }
      return result;
    };
  },

  record:
    <V>(valueMap: Mapper<V>) =>
    (source: unknown, path = ''): Record<string, V> => {
      if (!isJsonObject(source)) {
        throw new ValidationError('Expected object', path);
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
          mapped[key] = valueMap(value, `${path}.${key}`);
        }
      });
      return mapped;
    },

  array:
    <T>(map: Mapper<T>) =>
    (source: unknown, path = ''): T[] => {
      if (!Array.isArray(source)) {
        throw new ValidationError('Expected array', path);
      }
      if (map === jsonAny) {
        return source as T[];
      }
      return Array.prototype.map.call(source, (o, i) =>
        map(o, `${path}[${i}]`),
      ) as T[];
    },

  string: (source: unknown, path = ''): string => {
    if (typeof source !== 'string') {
      throw new ValidationError('Expected string', path);
    }
    return source;
  },

  number: (source: unknown, path = ''): number => {
    if (typeof source !== 'number') {
      throw new ValidationError('Expected number', path);
    }
    return source;
  },

  boolean: (source: unknown, path = ''): boolean => {
    if (typeof source !== 'boolean') {
      throw new ValidationError('Expected boolean', path);
    }
    return source;
  },

  primitive: (source: unknown, path = ''): string | number | boolean => {
    if (
      typeof source !== 'string' &&
      typeof source !== 'number' &&
      typeof source !== 'boolean'
    ) {
      throw new ValidationError('Expected primitive value', path);
    }
    return source;
  },

  extractObject: <T>(source: unknown, maps: ObjectMapper<T>): T =>
    jsonObject(maps)(source),
  parse: <T>(source: string, map: Mapper<T>): T => map(JSON.parse(source)),
};
