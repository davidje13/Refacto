export default class SubscriptionTracker {
  constructor(generator, destructor) {
    this.generator = generator;
    this.destructor = destructor;

    this.services = new Map();
  }

  subscribe(id) {
    let serviceInfo = this.services.get(id);
    if (!serviceInfo) {
      serviceInfo = {
        count: 0,
        service: this.generator(id),
      };
      this.services.set(id, serviceInfo);
    }

    serviceInfo.count += 1;
    return {
      service: serviceInfo.service,
      unsubscribe: () => this.unsubscribe(id),
    };
  }

  async unsubscribe(id) {
    await Promise.resolve(); // wait in case we immediately resubscribe

    const serviceInfo = this.services.get(id);
    if (!serviceInfo || serviceInfo.count <= 0) {
      throw new Error(`Service ${id} is not active`);
    }

    serviceInfo.count -= 1;
    if (serviceInfo.count > 0) {
      return;
    }

    this.services.delete(id);
    this.destructor(serviceInfo.service, id);
  }

  find(id) {
    return this.services.get(id)?.service;
  }
}
