export default class SubscriptionTracker {
  constructor(generator, destructor) {
    this.generator = generator;
    this.destructor = destructor;

    this.services = new Map();
  }

  async subscribe(id) {
    let serviceInfo = this.services.get(id);
    if (serviceInfo) {
      serviceInfo.count += 1;
      serviceInfo.onReady = null;
      if (!serviceInfo.failed) {
        return;
      }
      serviceInfo.service = null;
      serviceInfo.failed = false;
    } else {
      serviceInfo = {
        count: 1,
        service: null,
        failed: false,
        onReady: null,
      };
    }
    this.services.set(id, serviceInfo);
    try {
      serviceInfo.service = await this.generator(id);
    } catch (e) {
      serviceInfo.failed = true;
      return;
    }
    serviceInfo.onReady?.();
  }

  async unsubscribe(id) {
    await Promise.resolve(); // wait in case we immediately resubscribe

    const serviceInfo = this.services.get(id);
    if (!serviceInfo || serviceInfo.count <= 0) {
      throw new Error(`Retro service ${id} is not open`);
    }

    serviceInfo.count -= 1;
    if (serviceInfo.count > 0) {
      return;
    }

    const remove = () => {
      this.services.delete(id);
      this.destructor(serviceInfo.service, id);
    };
    if (serviceInfo.service === null) {
      serviceInfo.onReady = remove;
    } else {
      remove();
    }
  }

  find(id) {
    return this.services.get(id)?.service;
  }
}
