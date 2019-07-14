function canonicalJSON(o) {
  if (o && typeof o === 'object' && !Array.isArray(o)) {
    const keys = Object.keys(o).slice();
    // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
    keys.sort(); // just need consistency
    const content = keys
      .map((key) => `${JSON.stringify(key)}:${canonicalJSON(o[key])}`)
      .join(',');
    return `{${content}}`;
  }
  return JSON.stringify(o);
}

function makeKey(id) {
  return canonicalJSON(id);
}

export default class SubscriptionTracker {
  constructor(generator, destructor) {
    this.generator = generator;
    this.destructor = destructor;

    this.services = new Map();
  }

  subscribe(id) {
    const key = makeKey(id);
    let serviceInfo = this.services.get(key);
    if (!serviceInfo) {
      serviceInfo = {
        count: 0,
        service: this.generator(id),
      };
      this.services.set(key, serviceInfo);
    }

    serviceInfo.count += 1;
    return {
      service: serviceInfo.service,
      unsubscribe: () => this.unsubscribe(id),
    };
  }

  async unsubscribe(id) {
    await Promise.resolve(); // wait in case we immediately resubscribe

    const key = makeKey(id);
    const serviceInfo = this.services.get(key);
    if (!serviceInfo || serviceInfo.count <= 0) {
      throw new Error(`Service ${id} is not active`);
    }

    serviceInfo.count -= 1;
    if (serviceInfo.count > 0) {
      return;
    }

    this.services.delete(key);
    this.destructor(serviceInfo.service, id);
  }

  find(id) {
    const key = makeKey(id);
    const o = this.services.get(key);
    return o ? o.service : null; // TODO TypeScript#16
  }
}
