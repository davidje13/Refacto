import { randomUUID } from 'node:crypto';
import listCommands from 'json-immutability-helper/commands/list';
import { context, type Spec } from 'json-immutability-helper';
import { type Collection, type DB, type Wrapped } from 'collection-storage';
import {
  encryptByRecordWithMasterKey,
  migrate,
} from '../import-wrappers/collection-storage-wrap';
import srb, { type Permission } from 'shared-reducer-backend';
import { type Retro, type RetroSummary } from '../shared/api-entities';
import { extractRetro } from '../helpers/jsonParsers';

const VALID_SLUG = /^[a-z0-9][a-z0-9_\-]*$/;
const MAX_SLUG_LENGTH = 64;

function validateSlug(slug: string) {
  if (slug.length > MAX_SLUG_LENGTH) {
    throw new Error('URL is too long');
  }
  if (!VALID_SLUG.test(slug)) {
    throw new Error('Invalid URL');
  }
}

function dbErrorMessage(e: any): string {
  if (e.message === 'duplicate' || e.code === 11000) {
    return 'URL is already taken';
  }
  return e.message;
}

export class RetroService {
  public readonly retroBroadcaster: srb.Broadcaster<Retro, Spec<Retro>>;

  private readonly retroCollection: Collection<Retro>;

  public constructor(db: DB, encryptionKey: Buffer) {
    const enc = encryptByRecordWithMasterKey<string>(
      encryptionKey,
      db.getCollection('retro_key'),
      { keyCache: { capacity: 128 } },
    );

    this.retroCollection = migrate(
      {
        groupStates: (v) => v || {},
      },
      enc<Retro>()(
        ['items'],
        db.getCollection<Wrapped<Retro, 'items', Buffer>>('retro', {
          slug: { unique: true },
          ownerId: {},
        }),
      ),
    );

    const model = new srb.CollectionStorageModel(
      this.retroCollection,
      'id',
      (x) => {
        const d = extractRetro(x);
        validateSlug(d.slug);
        return d;
      },
      (e) => e,
      (e) => new Error(dbErrorMessage(e)),
    );

    this.retroBroadcaster = srb.Broadcaster.for<Retro>(model)
      .withReducer<Spec<Retro>>(context.with(listCommands))
      .build();
  }

  public getPermissions(allowWrite: boolean): Permission<Retro, Spec<Retro>> {
    if (allowWrite) {
      return new srb.ReadWriteStruct(['id', 'ownerId']);
    }
    return srb.ReadOnly;
  }

  public async getRetroIdForSlug(slug: string): Promise<string | null> {
    const retroData = await this.retroCollection.get('slug', slug, ['id']);
    if (!retroData) {
      return null;
    }
    return retroData.id;
  }

  public async createRetro(
    ownerId: string,
    slug: string,
    name: string,
    format: string,
  ): Promise<string> {
    validateSlug(slug);
    const id = randomUUID();

    try {
      await this.retroCollection.add({
        id,
        slug,
        name,
        ownerId,
        state: {},
        groupStates: {},
        format,
        options: {},
        items: [],
      });
    } catch (e) {
      throw new Error(dbErrorMessage(e));
    }

    return id;
  }

  public getRetroListForUser(ownerId: string): Promise<RetroSummary[]> {
    return this.retroCollection.getAll('ownerId', ownerId, [
      'id',
      'slug',
      'name',
    ]);
  }

  public async isRetroOwnedByUser(
    retroId: string,
    ownerId: string,
  ): Promise<boolean> {
    const retro = await this.retroCollection.get('id', retroId, ['ownerId']);
    if (!retro) {
      return false;
    }
    return retro.ownerId === ownerId;
  }

  public getRetro(retroId: string): Promise<Retro | null> {
    return this.retroCollection.get('id', retroId);
  }
}
