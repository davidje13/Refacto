function sleep(millis) {
  if (!millis) {
    return null;
  }

  // Simulate data access delays to ensure non-flakey e2e tests, etc.
  return new Promise((resolve) => setTimeout(resolve, millis));
}

export default class InMemoryMap {
  constructor() {
    this.data = new Map();
    this.simulatedDelay = 0;
  }

  async set(key, value) {
    await sleep(this.simulatedDelay);
    this.data.set(key, JSON.stringify(value));
  }

  async get(key) {
    await sleep(this.simulatedDelay);

    const raw = this.data.get(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  }

  async unset(key) {
    await sleep(this.simulatedDelay);

    this.data.delete(key);
  }
}
