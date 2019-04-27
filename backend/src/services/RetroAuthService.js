export default class RetroAuthService {
  constructor(retroAuthMap, hasher, tokenManager) {
    this.hasher = hasher;
    this.tokenManager = tokenManager;
    this.retroAuthMap = retroAuthMap;
  }

  async setPassword(retroId, password) {
    const keys = await this.tokenManager.generateKeys();
    await this.retroAuthMap.set(retroId, {
      hash: await this.hasher.hash(password),
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
    });
  }

  async exchangePassword(retroId, password, tokenData) {
    const retroData = await this.retroAuthMap.get(retroId);
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

  async grantToken(retroId, tokenData) {
    const retroData = await this.retroAuthMap.get(retroId);
    if (!retroData) {
      return null;
    }

    return this.tokenManager.signData(tokenData, retroData.privateKey);
  }

  async readAndVerifyToken(retroId, retroToken) {
    const retroData = await this.retroAuthMap.get(retroId);
    if (!retroData) {
      return false;
    }

    return this.tokenManager.readAndVerifySigned(
      retroToken,
      retroData.publicKey,
    );
  }
}
