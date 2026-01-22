import type { Collection, DB } from 'collection-storage';
import type { Hasher } from 'pwd-hasher';
import type { TokenManager } from '../tokens/TokenManager';
import { json } from '../helpers/json';

interface RetroAuth {
  id: string;
  privateKey: string;
  publicKey: string;
  passwordHash: string;
}

const tokenLifespan = 60 * 60 * 24 * 30 * 6;

const USER_SCOPES = new Set(['read', 'readArchives', 'write', 'manage']);
const PASSWORD_SCOPES = new Set(['read', 'readArchives', 'write', 'manage']);

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
      await this.retroAuthCollection.where('id', retroId).update(
        {
          passwordHash,
          privateKey: keys.privateKey,
          publicKey: keys.publicKey,
        },
        { upsert: true },
      );
    } else {
      await this.retroAuthCollection
        .where('id', retroId)
        .update({ passwordHash });
    }
  }

  public async grantForPassword(
    retroId: string,
    password: string,
    scopes: ScopesConfig = {},
  ) {
    const retroData = await this.retroAuthCollection
      .where('id', retroId)
      .attrs(['passwordHash'])
      .get();
    if (!retroData) {
      return null;
    }
    const resolvedScopes = resolveScopes(PASSWORD_SCOPES, scopes);

    const match = await this.hasher.compare(password, retroData.passwordHash);
    if (!match) {
      return null;
    }

    if (this.hasher.needsRegenerate(retroData.passwordHash)) {
      await this.setPassword(retroId, password, { cycleKeys: false });
    }
    return this.grantToken(retroId, resolvedScopes);
  }

  public grantOwnerToken(retroId: string, scopes: ScopesConfig = {}) {
    const resolvedScopes = resolveScopes(USER_SCOPES, scopes);
    return this.grantToken(retroId, resolvedScopes);
  }

  public async grantToken(
    retroId: string,
    scopes: Readonly<Record<string, boolean>>,
  ) {
    const retroData = await this.retroAuthCollection
      .where('id', retroId)
      .attrs(['privateKey'])
      .get();
    if (!retroData) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + tokenLifespan;
    const tokenData: RetroJWTPayload = {
      iat: now,
      exp,
      aud: `retro-${retroId}`,
      scopes,
    };

    return {
      token: this.tokenManager.signData(tokenData, retroData.privateKey),
      scopes: new Set(
        Object.entries(scopes)
          .filter(([_, v]) => v)
          .map(([k]) => k),
      ),
      expires: exp * 1000,
    };
  }

  public async readAndVerifyToken(
    retroId: string,
    retroToken: string,
  ): Promise<RetroJWTPayload | null> {
    const retroData = await this.retroAuthCollection
      .where('id', retroId)
      .attrs(['publicKey'])
      .get();
    if (!retroData) {
      return null;
    }

    const raw = this.tokenManager.readAndVerifySigned(
      retroToken,
      retroData.publicKey,
      { verifyAud: `retro-${retroId}` },
    );
    if (!raw) {
      return null;
    }
    return extractRetroJwtPayload(raw);
  }
}

export class ScopesError extends Error {}

function resolveScopes(
  available: Set<string>,
  request: ScopesConfig,
): Record<string, boolean> {
  const scopes: Record<string, boolean> = {};
  for (const scope of request.required ?? []) {
    if (!available.has(scope)) {
      throw new ScopesError(
        `The requested scope ${JSON.stringify(scope)} is not available`,
      );
    }
    scopes[scope] = true;
  }
  for (const scope of request.optional ?? available) {
    if (available.has(scope)) {
      scopes[scope] = true;
    }
  }
  if (!Object.entries(scopes).length) {
    throw new ScopesError('No requested scopes are available');
  }
  return scopes;
}

export interface ScopesConfig {
  required?: string[] | undefined;
  optional?: string[] | undefined;
}

interface RetroJWTPayload {
  iat: number;
  exp: number;
  aud: string;
  scopes: Record<string, boolean>;
}

const extractRetroJwtPayload = json.object<RetroJWTPayload>({
  iat: json.number,
  exp: json.number,
  aud: json.string,
  scopes: json.record(json.boolean),
});
