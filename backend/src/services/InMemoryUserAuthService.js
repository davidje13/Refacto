function sleep(millis) {
  // Simulate data access delays to ensure non-flakey e2e tests, etc.
  return new Promise((resolve) => setTimeout(resolve, millis));
}

export default class InMemoryUserAuthService {
  constructor(tokenManager) {
    this.tokenManager = tokenManager;
    this.privateKey = null;
    this.publicKey = null;
    this.simulatedDelay = 0;
  }

  async generateKeys() {
    const keys = await this.tokenManager.generateKeys();
    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;
  }

  async grantToken(tokenData) {
    await sleep(this.simulatedDelay);
    return this.tokenManager.signData(tokenData, this.privateKey);
  }

  async readAndVerifyToken(userToken) {
    await sleep(this.simulatedDelay);
    return this.tokenManager.readAndVerifySigned(userToken, this.publicKey);
  }
}
