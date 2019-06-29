import uuidv4 from 'uuid/v4';
import { Collection, DB } from 'collection-storage';
import RetroArchive from '../data/RetroArchive';
import RetroData from '../data/RetroData';

export default class RetroArchiveService {
  private readonly archiveCollection: Collection<RetroArchive>;

  public constructor(db: DB) {
    this.archiveCollection = db.getCollection<RetroArchive>('archive', {
      retroId: {},
    });
  }

  public async createArchive(
    retroId: string,
    { format = '', items = [] }: Partial<RetroData>,
  ): Promise<string> {
    const id = uuidv4();
    const created = Date.now();

    await this.archiveCollection.add({
      id,
      retroId,
      created,
      data: { format, items },
    });

    return id;
  }

  public getRetroArchiveList(retroId: string): Promise<Readonly<RetroArchive>[]> {
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
