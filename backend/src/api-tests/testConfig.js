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

function isObj(x) {
  return x && typeof x === 'object';
}

function deepMerge(a, b) {
  if (!isObj(a) || !isObj(b)) {
    return b;
  }
  const r = Object.assign({}, a);
  Object.keys(b).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(a, key)) {
      r[key] = deepMerge(a[key], b[key]);
    } else {
      r[key] = b[key];
    }
  });
  return r;
}

export default (overrides = {}) => deepMerge(baseTestConfig, overrides);
