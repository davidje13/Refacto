import uuidv4 from 'uuid/v4';

export default class RetroArchiveService {
  constructor(db) {
    this.archiveCollection = db.getCollection('archive', {
      retroId: {},
    });
  }

  async createArchive(retroId, { format, items = [] }) {
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

  getRetroArchiveList(retroId) {
    return this.archiveCollection
      .getAll('retroId', retroId, ['id', 'created']);
  }

  async getRetroArchive(retroId, archiveId) {
    const archiveData = await this.archiveCollection.get('id', archiveId);
    if (!archiveData || archiveData.retroId !== retroId) {
      return null;
    }
    return archiveData;
  }
}
