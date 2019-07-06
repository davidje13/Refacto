const baseTestConfig = {
  password: {
    workFactor: 1,
  },
  token: {},
  db: {
    url: 'memory://',
  },
  sso: {},
};

function isObj(x: any): x is { [key: string]: any } {
  return x && typeof x === 'object';
}

function deepMerge<T, U>(a: T, b?: U): T & U {
  if (!isObj(a) || !isObj(b)) {
    return b as (T & U);
  }
  const r = Object.assign({}, a) as any;
  Object.keys(b).forEach((k): void => {
    const key = k as keyof U;
    if (Object.prototype.hasOwnProperty.call(a, key)) {
      r[key] = deepMerge((a as any)[key], b[key]);
    } else {
      r[key] = b[key];
    }
  });
  return r as (T & U);
}

export default (
  overrides: any = {},
): any => deepMerge(baseTestConfig, overrides);