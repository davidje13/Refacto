import type { DB } from 'collection-storage';
import type { JWTPayload } from 'websocket-express';
import type { TokenManager, KeyPair } from '../tokens/TokenManager';

interface StoredKeyPair extends KeyPair {
  id: string;
}

export default class UserAuthService {
  private privateKey?: string;

  private publicKey?: string;

  public constructor(
    private readonly tokenManager: TokenManager,
    private readonly loginTokenLifespan = 60 * 60 * 2,
  ) {
    this.tokenManager = tokenManager;
  }

  public async initialise(db: DB): Promise<void> {
    const configCollection = db.getCollection<StoredKeyPair>('config');
    let keys = await configCollection
      .get('id', 'user-auth', ['privateKey', 'publicKey']);
    if (!keys) {
      keys = await this.tokenManager.generateKeys();
      configCollection.add({ id: 'user-auth', ...keys });
    }
    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;
  }

  public grantLoginToken = (userId: string, service: string): string => {
    const now = Math.floor(Date.now() / 1000);

    return this.grantToken({
      iat: now,
      exp: now + this.loginTokenLifespan,
      aud: 'user',
      iss: service,
      sub: userId,
    });
  };

  public grantToken(tokenData: JWTPayload): string {
    if (!this.privateKey) {
      throw new Error('Not initialised');
    }
    return this.tokenManager.signData(tokenData, this.privateKey);
  }

  public readAndVerifyToken(userToken: string): JWTPayload | null {
    if (!this.publicKey) {
      throw new Error('Not initialised');
    }
    return this.tokenManager.readAndVerifySigned(userToken, this.publicKey);
  }
}
