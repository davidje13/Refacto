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

function isObj(x: unknown): x is Record<string, unknown> {
  return x && typeof x === 'object';
}

function deepMerge<T, U>(a: T, b?: U): T & U {
  if (!isObj(a) || !isObj(b)) {
    return b as (T & U);
  }
  const r = Object.assign({}, a) as (T & U);
  Object.keys(b).forEach((k) => {
    const key = k as keyof U;
    if (Object.prototype.hasOwnProperty.call(a, key)) {
      r[key] = deepMerge((a as any)[key], b[key]);
    } else {
      r[key] = b[key] as any;
    }
  });
  return r;
}

export default (
  overrides: any = {},
): any => deepMerge(baseTestConfig, overrides);
