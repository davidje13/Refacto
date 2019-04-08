function sleep(millis) {
  // Simulate data access delays to ensure non-flakey e2e tests, etc.
  return new Promise((resolve) => setTimeout(resolve, millis));
}

export default class InMemoryAuthService {
  constructor(hasher, tokenManager) {
    this.hasher = hasher;
    this.tokenManager = tokenManager;
    this.data = new Map();
  }

  async setPassword(retroId, password) {
    await sleep(100);
    const keys = await this.tokenManager.generateKeys();
    this.data.set(retroId, {
      hash: await this.hasher.hash(password),
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
    });
  }

  async exchangePassword(retroId, password, tokenData) {
    await sleep(100);
    const retroData = this.data.get(retroId);
    if (!retroData) {
      return null;
    }

    const match = await this.hasher.compare(password, retroData.hash);
    if (!match) {
      return null;
    }

    if (this.hasher.needsRegenerate(retroData.hash)) {
      this.setPassword(retroId, password);
    }
    return this.tokenManager.signData(tokenData, retroData.privateKey);
  }

  async readAndVerifyToken(retroId, token) {
    await sleep(100);
    const retroData = this.data.get(retroId);
    if (!retroData) {
      return false;
    }

    return this.tokenManager.readAndVerifySigned(token, retroData.publicKey);
  }
}
