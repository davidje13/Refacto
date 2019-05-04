export default class UserAuthService {
  constructor(tokenManager) {
    this.tokenManager = tokenManager;
    this.privateKey = null;
    this.publicKey = null;
  }

  async initialise(db) {
    const configCollection = db.getCollection('config');
    let keys = await configCollection
      .get('id', 'user-auth', ['privateKey', 'publicKey']);
    if (!keys) {
      keys = await this.tokenManager.generateKeys();
      configCollection.add({ id: 'user-auth', ...keys });
    }
    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;
  }

  grantToken(tokenData) {
    return this.tokenManager.signData(tokenData, this.privateKey);
  }

  readAndVerifyToken(userToken) {
    return this.tokenManager.readAndVerifySigned(userToken, this.publicKey);
  }
}
