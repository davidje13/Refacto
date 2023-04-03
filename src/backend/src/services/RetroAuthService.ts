import type { Collection, DB } from 'collection-storage';
import type { JWTPayload } from 'websocket-express';
import type Hasher from 'pwd-hasher';
import type { TokenManager } from '../tokens/TokenManager';
import json from '../helpers/json';

interface RetroAuth {
  id: string;
  privateKey: string;
  publicKey: string;
  passwordHash: string;
}

const tokenLifespan = 60 * 60 * 24 * 30 * 6;

const USER_SCOPES = {
  read: true,
  readArchives: true,
  write: true,
};

const PASSWORD_SCOPES = {
  read: true,
  readArchives: true,
  write: true,
};

const extractJwtPayload = json.object<JWTPayload>({
  iss: json.optional(json.string),
  iat: json.optional(json.number),
  nbf: json.optional(json.number),
  exp: json.optional(json.number),
  sub: json.optional(json.string),
  aud: json.optional(json.string),
  jti: json.optional(json.string),
  scopes: json.optional(
    json.oneOf(json.array(json.string), json.record(json.boolean), json.string),
  ),
});

export class RetroAuthService {
  private readonly retroAuthCollection: Collection<RetroAuth>;

  public constructor(
    db: DB,
    private readonly hasher: Hasher,
    private readonly tokenManager: TokenManager,
  ) {
    this.retroAuthCollection = db.getCollection<RetroAuth>('retro_auth');
  }

  public async setPassword(
    retroId: string,
    password: string,
    { cycleKeys = true } = {},
  ): Promise<void> {
    const passwordHash = await this.hasher.hash(password);
    if (cycleKeys) {
      const keys = await this.tokenManager.generateKeys();
      await this.retroAuthCollection.update(
        'id',
        retroId,
        {
          passwordHash,
          privateKey: keys.privateKey,
          publicKey: keys.publicKey,
        },
        { upsert: true },
      );
    } else {
      await this.retroAuthCollection.update('id', retroId, { passwordHash });
    }
  }

  public async grantForPassword(
    retroId: string,
    password: string,
  ): Promise<string | null> {
    const retroData = await this.retroAuthCollection.get('id', retroId, [
      'passwordHash',
    ]);
    if (!retroData) {
      return null;
    }

    const match = await this.hasher.compare(password, retroData.passwordHash);
    if (!match) {
      return null;
    }

    if (this.hasher.needsRegenerate(retroData.passwordHash)) {
      await this.setPassword(retroId, password, { cycleKeys: false });
    }
    return this.grantToken(retroId, PASSWORD_SCOPES);
  }

  public grantOwnerToken(retroId: string): Promise<string | null> {
    return this.grantToken(retroId, USER_SCOPES);
  }

  public async grantToken(
    retroId: string,
    scopes: Readonly<Record<string, boolean>>,
  ): Promise<string | null> {
    const retroData = await this.retroAuthCollection.get('id', retroId, [
      'privateKey',
    ]);
    if (!retroData) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const tokenData = {
      iat: now,
      exp: now + tokenLifespan,
      aud: `retro-${retroId}`,
      scopes,
    };

    return this.tokenManager.signData(tokenData, retroData.privateKey);
  }

  public async readAndVerifyToken(
    retroId: string,
    retroToken: string,
  ): Promise<JWTPayload | null> {
    const retroData = await this.retroAuthCollection.get('id', retroId, [
      'publicKey',
    ]);
    if (!retroData) {
      return null;
    }

    const raw = this.tokenManager.readAndVerifySigned(
      retroToken,
      retroData.publicKey,
    );
    if (!raw) {
      return null;
    }
    return extractJwtPayload(raw);
  }
}
