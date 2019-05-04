export default class UserAuthService {
  constructor(tokenManager) {
    this.tokenManager = tokenManager;
    this.privateKey = null;
    this.publicKey = null;
  }

  async initialise(db) {
    const configMap = db.getMap('config');
    let keys = await configMap.get('user-auth-keys');
    if (!keys) {
      keys = await this.tokenManager.generateKeys();
      configMap.set('user-auth-keys', keys);
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
