import update from 'json-immutability-helper';
import uuidv4 from 'uuid/v4';

export default class RetroService {
  constructor(db, retroChangeSubs) {
    this.retroCollection = db.getCollection('retro', {
      slug: { unique: true },
      ownerId: {},
    });
    this.archiveCollection = db.getCollection('archive', {
      retroId: {},
    });
    this.retroChangeSubs = retroChangeSubs;
  }

  async internalDistribute(retroId, change, meta = {}) {
    const retroData = await this.retroCollection.get('id', retroId, ['retro']);
    const newRetro = update(retroData.retro, change);
    await this.retroCollection.update('id', retroId, { retro: newRetro });

    this.retroChangeSubs.broadcast(retroId, { change, meta });
  }

  async getRetroIdForSlug(slug) {
    const retroData = await this.retroCollection.get('slug', slug, ['id']);
    if (!retroData) {
      return null;
    }
    return retroData.id;
  }

  async createRetro(ownerId, slug, name, format) {
    const id = uuidv4();

    try {
      await this.retroCollection.add({
        id,
        slug,
        ownerId,
        retro: {
          name,
          state: {},
          data: { format, items: [] },
        },
      });
    } catch (e) {
      if (e.message === 'duplicate' || e.code === 11000) {
        throw new Error('slug exists');
      } else {
        throw e;
      }
    }

    return id;
  }

  async createArchive(retroId, { format, items = [] }) {
    const existing = await this.retroCollection.get('id', retroId, ['id']);
    if (!existing) {
      throw new Error('retro not found');
    }

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

  async getRetroListForUser(ownerId) {
    const raw = await this.retroCollection
      .getAll('ownerId', ownerId, ['id', 'slug', 'retro']);
    return raw.map(({ id, slug, retro: { name } }) => ({ id, slug, name }));
  }

  async subscribeRetro(retroId, onChange) {
    const retroData = await this.retroCollection.get('id', retroId, ['retro']);
    if (!retroData) {
      return null;
    }

    this.retroChangeSubs.add(retroId, onChange);

    let initialData = retroData.retro;

    return {
      getInitialData: () => {
        const data = initialData;
        initialData = null; // GC
        return data;
      },
      send: (change, meta) => this.internalDistribute(retroId, change, meta),
      close: () => this.retroChangeSubs.remove(retroId, onChange),
    };
  }

  async getRetroArchiveList(retroId) {
    const archives = await this.archiveCollection
      .getAll('retroId', retroId, ['id', 'created']);

    if (archives.length) {
      return archives;
    }

    const retroData = await this.retroCollection.get('id', retroId, ['id']);
    return (retroData === null ? null : archives);
  }

  async getRetroArchive(retroId, archiveId) {
    const archiveData = await this.archiveCollection.get('id', archiveId);
    if (!archiveData || archiveData.retroId !== retroId) {
      return null;
    }
    return archiveData;
  }
}
