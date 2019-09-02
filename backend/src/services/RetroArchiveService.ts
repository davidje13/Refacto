import uuidv4 from 'uuid/v4';
import { DB, Collection, encryptByRecordWithMasterKey } from 'collection-storage';
import { RetroArchive, RetroData, RetroArchiveSummary } from 'refacto-entities';

export default class RetroArchiveService {
  private readonly archiveCollection: Collection<RetroArchive>;

  public constructor(db: DB, encryptionKey: Buffer) {
    const enc = encryptByRecordWithMasterKey<RetroArchive>(
      encryptionKey.toString('base64'),
      db.getCollection('archive_key'),
      128,
    );

    this.archiveCollection = enc(['items'], db.getCollection('archive', {
      retroId: {},
    }));
  }

  public async createArchive(
    retroId: string,
    data: RetroData,
  ): Promise<string> {
    const id = uuidv4();
    const created = Date.now();

    await this.archiveCollection.add({
      id,
      retroId,
      created,
      format: data.format,
      options: data.options,
      items: data.items,
    });

    return id;
  }

  public getRetroArchiveList(retroId: string): Promise<Readonly<RetroArchiveSummary>[]> {
    return this.archiveCollection
      .getAll('retroId', retroId, ['id', 'created']);
  }

  public async getRetroArchive(
    retroId: string,
    archiveId: string,
  ): Promise<Readonly<RetroArchive> | null> {
    const archiveData = await this.archiveCollection.get('id', archiveId);
    if (!archiveData || archiveData.retroId !== retroId) {
      return null;
    }
    return archiveData;
  }
}
