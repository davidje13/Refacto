import update from 'json-immutability-helper';
import uuidv4 from 'uuid/v4';

function sleep(millis) {
  // Simulate data access delays to ensure non-flakey e2e tests, etc.
  return new Promise((resolve) => setTimeout(resolve, millis));
}

const filterSummaryInformation = ({ id, slug, retro: { name } }) => ({
  id,
  slug,
  name,
});

const filterArchiveSummaryInformation = ({ id, created }) => ({
  id,
  created,
});

export default class InMemoryRetroService {
  constructor(simulatedDelay = 0) {
    this.data = [];
    this.subscriptions = new Map();
    this.simulatedDelay = simulatedDelay;
  }

  async findRetroBySlug(slug) {
    await sleep(this.simulatedDelay);
    return this.data.find((retroData) => (retroData.slug === slug));
  }

  async findRetroById(id) {
    await sleep(this.simulatedDelay);
    return this.data.find((retroData) => (retroData.id === id));
  }

  async updateRetroById(id, newData) {
    await sleep(this.simulatedDelay);
    const index = this.data.findIndex((retroData) => (retroData.id === id));
    if (index !== -1) {
      this.data[index] = newData;
    }
  }

  addSubscriber(retroId, sub) {
    let subscribers = this.subscriptions.get(retroId);
    if (!subscribers) {
      subscribers = new Set();
      this.subscriptions.set(retroId, subscribers);
    }
    subscribers.add(sub);
  }

  removeSubscriber(retroId, sub) {
    const subscribers = this.subscriptions.get(retroId);
    if (subscribers) {
      subscribers.delete(sub);
      if (!subscribers.length) {
        this.subscriptions.delete(retroId);
      }
    }
  }

  broadcastSubscribers(retroId, ...args) {
    const subscribers = this.subscriptions.get(retroId);
    if (subscribers) {
      subscribers.forEach((sub) => sub(...args));
    }
  }

  async internalDistribute(retroId, change, meta = {}) {
    const retroData = await this.findRetroById(retroId);
    const newRetroData = update(retroData, { retro: change });
    await this.updateRetroById(retroId, newRetroData);

    this.broadcastSubscribers(retroId, change, meta);
  }

  async getRetroIdForSlug(slug) {
    const retroData = await this.findRetroBySlug(slug);
    if (!retroData) {
      return null;
    }
    return retroData.id;
  }

  async createRetro(
    ownerId,
    slug,
    name,
    format,
    { state = {}, items = [], archives = [] } = {},
  ) {
    const existing = await this.findRetroBySlug(slug);
    if (existing) {
      throw new Error('slug exists');
    }

    const id = uuidv4();

    this.data.push({
      id,
      slug,
      ownerId,
      retro: {
        name,
        state,
        data: { format, items },
        archives: archives.map(filterArchiveSummaryInformation),
      },
      archives,
    });

    return id;
  }

  async createArchive(retroId) {
    const retroData = await this.findRetroById(retroId);

    const id = uuidv4();
    const created = Date.now();

    retroData.archives.push({
      id,
      created,
      data: retroData.retro.data,
    });

    await this.internalDistribute(retroId, {
      data: { items: { $set: [] } },
      archives: { $push: [{ id, created }] },
    });

    return id;
  }

  async getRetroListForUser(id) {
    await sleep(this.simulatedDelay);
    return this.data
      .filter(({ ownerId }) => (ownerId === id))
      .map(filterSummaryInformation);
  }

  async subscribeRetro(retroId, onChange) {
    const retroData = await this.findRetroById(retroId);
    if (!retroData) {
      return null;
    }

    this.addSubscriber(retroId, onChange);

    let initialData = retroData.retro;

    return {
      getInitialData: () => {
        const data = initialData;
        initialData = null; // GC
        return data;
      },
      send: (change, meta) => this.internalDistribute(retroId, change, meta),
      close: () => this.removeSubscriber(retroId, onChange),
    };
  }

  async getRetroArchive(retroId, archiveId) {
    const retroData = await this.findRetroById(retroId);
    if (!retroData) {
      return null;
    }
    return retroData.archives
      .find((archive) => (archive.id === archiveId)) || null;
  }
}
