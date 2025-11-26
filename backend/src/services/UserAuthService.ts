import type { DB } from 'collection-storage';
import type { TokenManager, KeyPair } from '../tokens/TokenManager';
import { json } from '../helpers/json';

interface StoredKeyPair extends KeyPair {
  id: string;
}

export class UserAuthService {
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
    let keys = await configCollection.get('id', 'user-auth', [
      'privateKey',
      'publicKey',
    ]);
    if (!keys) {
      keys = await this.tokenManager.generateKeys();
      await configCollection.add({ id: 'user-auth', ...keys });
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

  public grantToken(tokenData: UserJWTPayload): string {
    if (!this.privateKey) {
      throw new Error('Not initialised');
    }
    return this.tokenManager.signData(tokenData, this.privateKey);
  }

  public readAndVerifyToken(userToken: string): UserJWTPayload {
    if (!this.publicKey) {
      throw new Error('Not initialised');
    }
    return extractUserJwtPayload(
      this.tokenManager.readAndVerifySigned(userToken, this.publicKey),
    );
  }
}

interface UserJWTPayload {
  iss: string;
  iat?: number | undefined;
  exp?: number | undefined;
  sub: string;
  aud: string;
  scopes?: string[] | Record<string, boolean> | string | undefined;
}

const extractUserJwtPayload = json.object<UserJWTPayload>({
  iss: json.string,
  iat: json.optional(json.number),
  exp: json.optional(json.number),
  sub: json.string,
  aud: json.string,
  scopes: json.optional(
    json.oneOf(json.array(json.string), json.record(json.boolean), json.string),
  ),
});
