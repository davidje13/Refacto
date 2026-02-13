import { randomUUID } from 'node:crypto';
import {
  encryptByRecordWithMasterKey,
  type Collection,
  type DB,
  type Wrapped,
} from 'collection-storage';
import type {
  RetroArchive,
  RetroData,
  RetroArchiveSummary,
} from '../shared/api-entities';

export class RetroArchiveService {
  declare private readonly archiveCollection: Collection<RetroArchive>;

  constructor(db: DB, encryptionKey: Buffer) {
    const enc = encryptByRecordWithMasterKey<string>(
      encryptionKey,
      db.getCollection('archive_key'),
      { keyCache: { capacity: 128 } },
    );

    this.archiveCollection = enc<RetroArchive>()(
      ['items'],
      db.getCollection<Wrapped<RetroArchive, 'items', Buffer>>('archive', {
        retroId: {},
      }),
    );
  }

  canArchive(retro: RetroData) {
    return retro.items.length > 0;
  }

  needArchive(retro: RetroData) {
    return retro.items.some((item) => item.category !== 'action');
  }

  async createArchive(
    retroId: string,
    data: RetroData,
    created?: number,
  ): Promise<string> {
    const id = randomUUID();
    const now = Date.now();

    await this.archiveCollection.add({
      id,
      retroId,
      created: created || now,
      imported: created ? now : null,
      format: data.format,
      options: data.options,
      items: data.items,
    });

    return id;
  }

  getRetroArchiveSummaries(
    retroId: string,
  ): AsyncGenerator<Readonly<RetroArchiveSummary>, void, undefined> {
    return this.archiveCollection
      .where('retroId', retroId)
      .attrs(['id', 'created', 'format'])
      .values();
  }

  async getRetroArchive(
    retroId: string,
    archiveId: string,
  ): Promise<Readonly<RetroArchive> | null> {
    const archiveData = await this.archiveCollection
      .where('id', archiveId)
      .get();
    if (!archiveData || archiveData.retroId !== retroId) {
      return null;
    }
    return archiveData;
  }

  getRetroArchiveList(retroId: string) {
    return this.archiveCollection.where('retroId', retroId).values();
  }

  async deleteRetro(retroId: string) {
    await this.archiveCollection.where('retroId', retroId).remove();
  }
}
