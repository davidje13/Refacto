import { v4 as uuidv4 } from 'uuid';
import { DB, Collection, encryptByRecordWithMasterKey } from 'collection-storage';
import {
  Broadcaster,
  TopicMap,
  TopicMessage,
  CollectionStorageModel,
  Permission,
  ReadOnly,
  ReadWriteStruct,
} from 'shared-reducer-backend';
import type { Retro, RetroSummary } from 'refacto-entities';
import { extractRetro } from '../helpers/jsonParsers';

const VALID_SLUG = /^[a-z0-9][a-z0-9_-]*$/;
const MAX_SLUG_LENGTH = 64;

function validateSlug(slug: string): void {
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

export default class RetroService {
  public readonly retroBroadcaster: Broadcaster<Retro>;

  private readonly retroCollection: Collection<Retro>;

  public constructor(
    db: DB,
    encryptionKey: Buffer,
    retroChangeSubs: TopicMap<TopicMessage<Retro>>,
  ) {
    const enc = encryptByRecordWithMasterKey(
      encryptionKey,
      db.getCollection('retro_key'),
      128,
    );

    this.retroCollection = enc<Retro>()(
      ['items'],
      db.getCollection('retro', {
        slug: { unique: true },
        ownerId: {},
      }),
    );

    const model = new CollectionStorageModel(
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

    this.retroBroadcaster = new Broadcaster<Retro>(model, retroChangeSubs);
  }

  // eslint-disable-next-line class-methods-use-this
  public getPermissions(allowWrite: boolean): Permission<Retro> {
    if (allowWrite) {
      return new ReadWriteStruct(['id', 'ownerId']);
    }
    return ReadOnly;
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
    const id = uuidv4();

    try {
      await this.retroCollection.add({
        id,
        slug,
        name,
        ownerId,
        state: {},
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
    return this.retroCollection
      .getAll('ownerId', ownerId, ['id', 'slug', 'name']);
  }

  public async isRetroOwnedByUser(retroId: string, ownerId: string): Promise<boolean> {
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
