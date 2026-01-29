function canonicalJSON(o: any): string {
  if (o && typeof o === 'object' && !Array.isArray(o)) {
    const keys = Object.keys(o).slice().sort();
    const content = keys
      .map((key) => `${JSON.stringify(key)}:${canonicalJSON(o[key])}`)
      .join(',');
    return `{${content}}`;
  }
  return JSON.stringify(o);
}

function makeKey(id: any): string {
  return canonicalJSON(id);
}

interface ServiceInfo<T> {
  count: number;
  sExtra: string;
  service: T;
}

interface Subscription<T> {
  service: T;
  unsubscribe(): Promise<void>;
}

export class SubscriptionTracker<K, E, S> {
  private readonly services = new Map<string, ServiceInfo<S>>();

  constructor(
    private readonly generator: (id: K, extra: E) => S,
    private readonly destructor: (service: S, id: K) => void,
    private readonly reconnector?: (service: S, id: K, extra: E) => void,
  ) {}

  subscribe(id: K, extra: E): Subscription<S> {
    const key = makeKey(id);
    let serviceInfo = this.services.get(key);
    const sExtra = makeKey(extra);
    if (!serviceInfo) {
      serviceInfo = {
        count: 0,
        sExtra: sExtra,
        service: this.generator(id, extra),
      };
      this.services.set(key, serviceInfo);
    } else if (sExtra !== serviceInfo.sExtra) {
      serviceInfo.sExtra = sExtra;
      this.reconnector?.(serviceInfo.service, id, extra);
    }

    serviceInfo.count += 1;
    return {
      service: serviceInfo.service,
      unsubscribe: (): Promise<void> => this._unsubscribe(id, key),
    };
  }

  private async _unsubscribe(id: K, key: string): Promise<void> {
    await Promise.resolve(); // wait in case we immediately resubscribe

    const serviceInfo = this.services.get(key);
    if (!serviceInfo || serviceInfo.count <= 0) {
      throw new Error(`Service ${id} is not active`);
    }

    serviceInfo.count -= 1;
    if (serviceInfo.count === 0) {
      this.services.delete(key);
      this.destructor(serviceInfo.service, id);
    }
  }

  find(id: K): S | null {
    const key = makeKey(id);
    const o = this.services.get(key);
    return o?.service ?? null;
  }
}
