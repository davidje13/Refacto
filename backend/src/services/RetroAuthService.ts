import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Collection, DB } from 'collection-storage';
import type { Hasher } from 'pwd-hasher';
import type { NewRetroApiKey, RetroApiKey } from '../shared/api-entities';
import type { TokenManager } from '../tokens/TokenManager';
import { json } from '../helpers/json';

interface RetroAuth {
  id: string;
  privateKey: string;
  publicKey: string;
  passwordHash: string;
}

interface RetroApiKeyStorage extends RetroApiKey {
  retroId: string;
  keyHash: string;
}

const OWNER_SCOPES = new Set(['read', 'readArchives', 'write', 'manage']);
const PASSWORD_SCOPES = new Set(['read', 'readArchives', 'write', 'manage']);

interface RetroAuthOptions {
  ownerTokenLifespan: number;
  passwordTokenLifespan: number;
  keyTokenLifespan: number;
  retroApiKeyLimit: number;
}

export class RetroAuthService {
  declare private readonly hasher: Hasher;
  declare private readonly tokenManager: TokenManager;
  declare private readonly retroAuthCollection: Collection<RetroAuth>;
  declare private readonly retroApiKeyCollection: Collection<RetroApiKeyStorage>;
  declare private readonly ownerTokenLifespan: number;
  declare private readonly passwordTokenLifespan: number;
  declare private readonly keyTokenLifespan: number;
  declare private readonly retroApiKeyLimit: number;

  constructor(
    db: DB,
    hasher: Hasher,
    tokenManager: TokenManager,
    options: RetroAuthOptions,
  ) {
    this.hasher = hasher;
    this.tokenManager = tokenManager;
    this.retroAuthCollection = db.getCollection<RetroAuth>('retro_auth');
    this.retroApiKeyCollection = db.getCollection<RetroApiKeyStorage>(
      'retro_api_key',
      {
        keyHash: { unique: true },
        retroId: {},
      },
    );
    this.ownerTokenLifespan = options.ownerTokenLifespan;
    this.passwordTokenLifespan = options.passwordTokenLifespan;
    this.keyTokenLifespan = options.keyTokenLifespan;
    this.retroApiKeyLimit = options.retroApiKeyLimit;
  }

  async setPassword(
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

  async createApiKey(
    retroId: string,
    name: string,
    scopes: string[],
  ): Promise<NewRetroApiKey | null> {
    const id = randomUUID();
    const key = randomBytes(48).toString('base64url');
    const keyHash = hashKey(retroId, key);

    // check key limit - this is not enforced atomically so it is possible for
    // races to exceed the limit, but it only exists to catch client mistakes
    // like creating a new key with every connection, so this is good enough.
    const existing = await this.retroApiKeyCollection
      .where('retroId', retroId)
      .count();
    if (existing >= this.retroApiKeyLimit) {
      return null;
    }

    await this.retroApiKeyCollection.add({
      id,
      name,
      created: Date.now(),
      lastUsed: 0,
      retroId,
      keyHash,
      scopes: [...new Set(scopes)].sort(),
    });
    return { id, key };
  }

  getApiKeysForRetro(
    retroId: string,
  ): AsyncGenerator<Readonly<RetroApiKey>, void, undefined> {
    return this.retroApiKeyCollection
      .where('retroId', retroId)
      .attrs(['id', 'name', 'created', 'lastUsed', 'scopes'])
      .values();
  }

  async deleteApiKey(retroId: string, apiKeyId: string) {
    const keyData = await this.retroApiKeyCollection
      .where('id', apiKeyId)
      .attrs(['retroId'])
      .get();
    if (!keyData || keyData.retroId !== retroId) {
      return false;
    }
    const deleted = await this.retroApiKeyCollection
      .where('id', apiKeyId)
      .remove();
    return deleted > 0;
  }

  async deleteRetro(retroId: string) {
    await this.retroAuthCollection.where('id', retroId).remove();
    await this.retroApiKeyCollection.where('retroId', retroId).remove();
  }

  async grantForPassword(
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
    return this.grantToken(retroId, this.passwordTokenLifespan, {
      iss: 'retro-password',
      scopes: resolvedScopes,
    });
  }

  async grantForApiKey(
    retroId: string,
    apiKey: string,
    scopes: ScopesConfig = {},
  ) {
    const keyData = await this.retroApiKeyCollection
      .where('keyHash', hashKey(retroId, apiKey))
      .attrs(['id', 'retroId', 'scopes'])
      .get();
    if (!keyData || keyData.retroId !== retroId) {
      return null;
    }

    const token = await this.grantToken(retroId, this.keyTokenLifespan, {
      iss: 'retro-key',
      sub: keyData.id,
      scopes: resolveScopes(new Set(keyData.scopes), scopes),
    });
    await this.retroApiKeyCollection
      .where('id', keyData.id)
      .update({ lastUsed: Date.now() });
    return token;
  }

  grantOwnerToken(retroId: string, scopes: ScopesConfig = {}) {
    return this.grantToken(retroId, this.ownerTokenLifespan, {
      iss: 'retro-owner',
      scopes: resolveScopes(OWNER_SCOPES, scopes),
    });
  }

  async grantToken(
    retroId: string,
    tokenLifespan: number,
    payload: Omit<RetroJWTPayload, 'iat' | 'exp' | 'aud'>,
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
      ...payload,
      iat: now,
      exp,
      aud: `retro-${retroId}`,
    };

    return {
      token: this.tokenManager.signData(tokenData, retroData.privateKey),
      scopes: new Set(
        Object.entries(payload.scopes)
          .filter(([_, v]) => v)
          .map(([k]) => k),
      ),
      expires: exp * 1000,
    };
  }

  async readAndVerifyToken(
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
    const data = extractRetroJwtPayload(raw);
    if (data.iss === 'retro-key') {
      if (!data.sub) {
        return null; // invalid data
      }
      const exists = await this.retroApiKeyCollection
        .where('id', data.sub)
        .exists();
      if (!exists) {
        return null; // key has been revoked
      }
    }
    return data;
  }
}

export class ScopesError extends Error {}

function hashKey(retroId: string, key: string) {
  const hash = createHash('sha256');
  hash.write(`${retroId}-${key}`);
  return hash.digest('base64url');
}

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
  iss?: string | undefined;
  iat: number;
  exp: number;
  sub?: string | undefined;
  aud: string;
  scopes: Record<string, boolean>;
}

const extractRetroJwtPayload = json.object<RetroJWTPayload>({
  iss: json.optional(json.string),
  iat: json.number,
  exp: json.number,
  sub: json.optional(json.string),
  aud: json.string,
  scopes: json.record(json.boolean),
});
