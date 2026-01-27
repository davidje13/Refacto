import { randomUUID } from 'node:crypto';
import listCommands from 'json-immutability-helper/commands/list';
import { context, type Context, type Spec } from 'json-immutability-helper';
import {
  DuplicateError,
  encryptByRecordWithMasterKey,
  migrate,
  type Collection,
  type DB,
  type Wrapped,
} from 'collection-storage';
import {
  Broadcaster,
  CollectionStorageModel,
  ReadOnly,
  ReadWriteStruct,
  type Permission,
  type EventFilter,
} from 'shared-reducer/backend';
import type { Retro, RetroSummary } from '../shared/api-entities';
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

function dbError(err: unknown): unknown {
  return err instanceof DuplicateError
    ? new Error('URL is already taken')
    : err;
}

export class RetroService {
  public readonly mutationContext: Context;
  public readonly retroBroadcaster: Broadcaster<Retro, Spec<Retro>>;
  private readonly retroCollection: Collection<Retro>;

  public constructor(db: DB, encryptionKey: Buffer) {
    const enc = encryptByRecordWithMasterKey<string>(
      encryptionKey,
      db.getCollection('retro_key'),
      { keyCache: { capacity: 128 } },
    );

    this.retroCollection = migrate(
      { groupStates: (v) => v || {} },
      enc<Retro>()(
        ['items'],
        db.getCollection<Wrapped<Retro, 'items', Buffer>>('retro', {
          slug: { unique: true },
          ownerId: {},
        }),
      ),
    );

    const model = new CollectionStorageModel(
      this.retroCollection,
      'id',
      (x) => {
        const d = extractRetro(x);
        validateSlug(d.slug);
        return d;
      },
      { writeErrorIntercept: dbError },
    );

    this.mutationContext = context.with(listCommands);
    this.retroBroadcaster = new Broadcaster<Retro, Spec<Retro>>(
      model,
      this.mutationContext,
    );
  }

  public getPermissions(allowWrite: boolean): Permission<Retro, Spec<Retro>> {
    if (allowWrite) {
      return new ReadWriteStruct(['id', 'ownerId']);
    }
    return ReadOnly;
  }

  public getEventFilter(allowWrite: boolean): EventFilter | undefined {
    if (allowWrite) {
      return undefined;
    }
    return (evt) => evt[0] === 'archive';
  }

  public async getRetroIdForSlug(slug: string): Promise<string | null> {
    const retroData = await this.retroCollection
      .where('slug', slug)
      .attrs(['id'])
      .get();
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

    return id;
  }

  public getRetroListForUser(
    ownerId: string,
  ): AsyncGenerator<RetroSummary, void, undefined> {
    return this.retroCollection
      .where('ownerId', ownerId)
      .attrs(['id', 'slug', 'name'])
      .values();
  }

  public async isRetroOwnedByUser(
    retroId: string,
    ownerId: string,
  ): Promise<boolean> {
    const retro = await this.retroCollection
      .where('id', retroId)
      .attrs(['ownerId'])
      .get();
    if (!retro) {
      return false;
    }
    return retro.ownerId === ownerId;
  }

  public getRetro(retroId: string): Promise<Retro | null> {
    return this.retroCollection.where('id', retroId).get();
  }
}
