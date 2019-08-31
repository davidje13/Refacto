import { ConfigT } from '../config';

// Thanks, https://stackoverflow.com/a/51365037/1180785
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

const baseTestConfig: ConfigT = {
  port: 1,
  forwardHost: '',
  mockSsoPort: 0,
  serverBindAddress: '',
  password: { workFactor: 1, secretPepper: '' },
  token: { secretPassphrase: '' },
  db: { url: 'memory://' },
  sso: {
    google: { clientId: '', authUrl: '', tokenInfoUrl: '' },
    github: {
      clientId: '',
      clientSecret: '',
      authUrl: '',
      accessTokenUrl: '',
      userUrl: '',
    },
  },
  giphy: { baseUrl: '', apiKey: '' },
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
  overrides: RecursivePartial<ConfigT> = {},
): ConfigT => deepMerge(baseTestConfig, overrides);
