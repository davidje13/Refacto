export default class RetroAuthService {
  constructor(db, hasher, tokenManager) {
    this.hasher = hasher;
    this.tokenManager = tokenManager;
    this.retroAuthCollection = db.getCollection('retro_auth');
  }

  async setPassword(retroId, password, { cycleKeys = true } = {}) {
    const hash = await this.hasher.hash(password);
    if (cycleKeys) {
      const keys = await this.tokenManager.generateKeys();
      await this.retroAuthCollection.update('id', retroId, {
        hash,
        privateKey: keys.privateKey,
        publicKey: keys.publicKey,
      }, { upsert: true });
    } else {
      await this.retroAuthCollection.update('id', retroId, { hash });
    }
  }

  async exchangePassword(retroId, password, tokenData) {
    const retroData = await this.retroAuthCollection
      .get('id', retroId, ['hash']);
    if (!retroData) {
      return null;
    }

    const match = await this.hasher.compare(password, retroData.hash);
    if (!match) {
      return null;
    }

    if (this.hasher.needsRegenerate(retroData.hash)) {
      this.setPassword(retroId, password, { cycleKeys: false });
    }
    return this.grantToken(retroId, tokenData);
  }

  async grantToken(retroId, tokenData) {
    const retroData = await this.retroAuthCollection
      .get('id', retroId, ['privateKey']);
    if (!retroData) {
      return null;
    }

    return this.tokenManager.signData(tokenData, retroData.privateKey);
  }

  async readAndVerifyToken(retroId, retroToken) {
    const retroData = await this.retroAuthCollection
      .get('id', retroId, ['publicKey']);
    if (!retroData) {
      return false;
    }

    return this.tokenManager.readAndVerifySigned(
      retroToken,
      retroData.publicKey,
    );
  }
}
