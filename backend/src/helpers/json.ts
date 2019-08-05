type Mapper<T> = (v: unknown) => T;

type ObjectMapper<T> = {
  [K in keyof T]: Mapper<T[K]>;
};

function isJsonObject(source: unknown): source is Record<any, unknown> {
  return source && typeof source === 'object';
}

const jsonObject = <T>(maps: ObjectMapper<T>) => (source: unknown): T => {
  if (!isJsonObject(source)) {
    throw new Error('Expected object');
  }
  const result: T = {} as any;
  Object.keys(maps).forEach((k) => {
    const key = k as keyof T;
    result[key] = maps[key](source[key]);
  });
  return result;
};

export default {
  nullable: <T>(submap: Mapper<T>) => (source: unknown): T | null => {
    if (source === null) {
      return null;
    }
    return submap(source);
  },

  optional: <T>(submap: Mapper<T>) => (source: unknown): T | undefined => {
    if (source === undefined) {
      return undefined;
    }
    return submap(source);
  },

  object: jsonObject,

  record: (source: unknown): Record<string, unknown> => {
    if (!isJsonObject(source)) {
      throw new Error('Expected object');
    }
    return source;
  },

  array: <T>(map: Mapper<T>) => (source: unknown): T[] => {
    if (!Array.isArray(source)) {
      throw new Error('Expected array');
    }
    return source.map(map);
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

  extractObject: <T>(source: unknown, maps: ObjectMapper<T>): T => jsonObject(maps)(source),
};
