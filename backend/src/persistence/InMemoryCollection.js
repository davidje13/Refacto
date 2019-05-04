function sleep(millis) {
  if (!millis) {
    return null;
  }

  // Simulate data access delays to ensure non-flakey e2e tests, etc.
  return new Promise((resolve) => setTimeout(resolve, millis));
}

function applyFilter(data, fields) {
  if (!fields) {
    return data;
  }
  const result = {};
  fields.forEach((field) => {
    result[field] = data[field];
  });
  return result;
}

export default class InMemoryCollection {
  constructor(keys = {}, simulatedDelay = 0) {
    this.data = new Map();
    this.keys = new Map();
    this.simulatedDelay = simulatedDelay;

    Object.keys(keys).forEach((key) => {
      this.keys.set(key, { map: new Map(), options: keys[key] });
    });
  }

  internalGetIds(keyName, key) {
    if (keyName === 'id') {
      return this.data.has(key) ? [key] : [];
    }
    const keyInfo = this.keys.get(keyName);
    if (!keyInfo) {
      throw new Error(`Requested key ${keyName} not indexed`);
    }
    const ids = keyInfo.map.get(key);
    return ids ? [...ids] : []; // convert set to array
  }

  internalCheckDuplicates(value) {
    if (this.data.has(value.id)) {
      throw new Error('duplicate');
    }
    this.keys.forEach(({ map, options }, key) => {
      if (options.unique && map.has(value[key])) {
        throw new Error('duplicate');
      }
    });
  }

  internalPopulateIndices(value) {
    this.keys.forEach(({ map }, key) => {
      const v = value[key];
      let o = map.get(v);
      if (!o) {
        o = new Set();
        map.set(v, o);
      }
      o.add(value.id);
    });
  }

  internalRemoveIndices(value) {
    this.keys.forEach(({ map }, key) => {
      const v = value[key];
      const o = map.get(v);
      o.delete(value.id);
      if (!o.length) {
        map.delete(v);
      }
    });
  }

  async add(value) {
    await sleep(this.simulatedDelay);

    this.internalCheckDuplicates(value);
    this.data.set(value.id, JSON.stringify(value));
    this.internalPopulateIndices(value);
  }

  async update(keyName, key, value, { upsert = false } = {}) {
    await sleep(this.simulatedDelay);

    const id = this.internalGetIds(keyName, key)[0];
    if (id === undefined) {
      if (upsert) {
        await this.add(Object.assign({ [keyName]: key }, value));
      }
      return;
    }
    const oldValue = JSON.parse(this.data.get(id));
    const newValue = Object.assign({}, oldValue, value);
    if (newValue.id !== oldValue.id) {
      throw new Error('Cannot update id');
    }
    this.internalRemoveIndices(oldValue);
    try {
      this.internalCheckDuplicates(value);
    } catch (e) {
      this.internalPopulateIndices(oldValue);
      throw e;
    }
    this.data.set(newValue.id, JSON.stringify(newValue));
    this.internalPopulateIndices(newValue);
  }

  async get(keyName, key, fields = null) {
    const all = await this.getAll(keyName, key, fields);
    if (!all.length) {
      return null;
    }
    return all[0];
  }

  async getAll(keyName, key, fields = null) {
    await sleep(this.simulatedDelay);

    return this.internalGetIds(keyName, key)
      .map((id) => applyFilter(JSON.parse(this.data.get(id)), fields));
  }
}
