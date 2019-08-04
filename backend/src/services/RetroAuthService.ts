import { Collection, DB } from 'collection-storage';
import { JWTPayload } from 'websocket-express';
import Hasher from 'pwd-hasher';
import TokenManager from '../tokens/TokenManager';

interface RetroAuth {
  privateKey: string;
  publicKey: string;
  hash: string;
}

export default class RetroAuthService {
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

  public async exchangePassword(
    retroId: string,
    password: string,
    tokenData: object,
  ): Promise<string | null> {
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

  public async grantToken(retroId: string, tokenData: JWTPayload): Promise<string | null> {
    const retroData = await this.retroAuthCollection
      .get('id', retroId, ['privateKey']);
    if (!retroData) {
      return null;
    }

    return this.tokenManager.signData(tokenData, retroData.privateKey);
  }

  public async readAndVerifyToken(retroId: string, retroToken: string): Promise<JWTPayload | null> {
    const retroData = await this.retroAuthCollection
      .get('id', retroId, ['publicKey']);
    if (!retroData) {
      return null;
    }

    return this.tokenManager.readAndVerifySigned(
      retroToken,
      retroData.publicKey,
    );
  }
}
