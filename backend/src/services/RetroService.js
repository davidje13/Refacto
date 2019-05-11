import update from 'json-immutability-helper';
import uuidv4 from 'uuid/v4';
import UniqueIdProvider from '../helpers/UniqueIdProvider';
import TaskQueueMap from '../task-queue/TaskQueueMap';

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
    this.idProvider = new UniqueIdProvider();
    this.taskQueues = new TaskQueueMap();
  }

  async internalApplyChange(retroId, change, source, meta) {
    const retroData = await this.retroCollection.get('id', retroId, ['retro']);
    try {
      const newRetro = update(retroData.retro, change);
      await this.retroCollection.update('id', retroId, { retro: newRetro });
    } catch (e) {
      this.retroChangeSubs.broadcast(retroId, {
        message: { error: e.message },
        source,
        meta,
      });
      return;
    }

    this.retroChangeSubs.broadcast(retroId, {
      message: { change },
      source,
      meta,
    });
  }

  async internalQueueChange(retroId, change, source, meta) {
    return this.taskQueues.push(retroId, () => this.internalApplyChange(
      retroId,
      change,
      source,
      meta,
    ));
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

  async updateRetro(retroId, change) {
    return this.internalQueueChange(retroId, change, null, null);
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

    const myId = this.idProvider.get();
    const eventHandler = ({ message, source, meta }) => {
      if (source === myId) {
        onChange(message, meta);
      } else {
        onChange(message, undefined);
      }
    };

    this.retroChangeSubs.add(retroId, eventHandler);

    let initialData = retroData.retro;

    return {
      getInitialData: () => {
        const data = initialData;
        initialData = null; // GC
        return data;
      },
      send: (change, meta) => this.internalQueueChange(
        retroId,
        change,
        myId,
        meta,
      ),
      close: () => this.retroChangeSubs.remove(retroId, eventHandler),
    };
  }
}
