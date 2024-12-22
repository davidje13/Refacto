import { type ConfigT } from '../config';

// Thanks, https://stackoverflow.com/a/51365037/1180785
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends Record<string, unknown>
      ? RecursivePartial<T[P]>
      : T[P];
};

const baseTestConfig: ConfigT = {
  port: 1,
  forwardHost: '',
  mockSsoPort: 0,
  serverBindAddress: '',
  trustProxy: false,
  password: { workFactor: 1, secretPepper: '' },
  passwordCheck: { baseUrl: '' },
  token: { secretPassphrase: '' },
  encryption: { secretKey: '' },
  db: { url: 'memory://' },
  insecure: {
    sharedAccount: {
      enabled: false,
      authUrl: '/insecure-login',
    },
  },
  permit: {
    myRetros: true,
  },
  sso: {
    google: { clientId: '', authUrl: '', tokenInfoUrl: '' },
    github: {
      clientId: '',
      clientSecret: '',
      authUrl: '',
      accessTokenUrl: '',
      userUrl: '',
    },
    gitlab: { clientId: '', authUrl: '', tokenInfoUrl: '' },
  },
  giphy: { baseUrl: '', apiKey: '' },
};

function isObj(x: unknown): x is Record<string, unknown> {
  return Boolean(x && typeof x === 'object');
}

function deepMerge<T, U>(a: T, b?: U): T & U {
  if (!isObj(a) || !isObj(b)) {
    return b as T & U;
  }
  const r = { ...a } as T & U;
  Object.keys(b).forEach((k) => {
    const key = k as keyof U & keyof T;
    if (key in a) {
      r[key] = deepMerge(a[key], b[key]);
    } else {
      r[key] = b[key] as T[typeof key] & U[typeof key];
    }
  });
  return r;
}

export const testConfig = (
  overrides: RecursivePartial<ConfigT> = {},
): ConfigT => deepMerge(baseTestConfig, overrides);
