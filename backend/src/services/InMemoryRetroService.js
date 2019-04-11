import update from 'json-immutability-helper';
import uuidv4 from 'uuid/v4';

function sleep(millis) {
  // Simulate data access delays to ensure non-flakey e2e tests, etc.
  return new Promise((resolve) => setTimeout(resolve, millis));
}

const filterSummaryInformation = ({ retro: { id, slug, name } }) => ({
  id,
  slug,
  name,
});

const filterArchiveSummaryInformation = ({ id, created }) => ({
  id,
  created,
});

export default class InMemoryRetroService {
  constructor() {
    this.data = [];
    this.simulatedDelay = 0;
    this.simulatedSocketDelay = 0;
  }

  async internalDistribute(retroData, change, meta = {}) {
    await sleep(this.simulatedSocketDelay);
    /* eslint-disable-next-line no-param-reassign */ // shared data
    retroData.retro = update(retroData.retro, change);
    retroData.subscriptions.forEach((sub) => sub(change, meta));
  }

  async findRetroBySlug(slug) {
    await sleep(this.simulatedDelay);
    return this.data.find((retroData) => (retroData.retro.slug === slug));
  }

  async findRetroById(id) {
    await sleep(this.simulatedDelay);
    return this.data.find((retroData) => (retroData.retro.id === id));
  }

  async getRetroIdForSlug(slug) {
    const retroData = await this.findRetroBySlug(slug);
    if (!retroData) {
      return null;
    }
    return retroData.retro.id;
  }

  async createRetro(
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
      retro: {
        id,
        slug,
        name,
        state,
        data: { format, items },
        archives: archives.map(filterArchiveSummaryInformation),
      },
      archives,
      subscriptions: [],
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

    await this.internalDistribute(retroData, {
      data: { items: { $set: [] } },
      archives: { $push: [{ id, created }] },
    });

    return id;
  }

  async getRetroList() {
    await sleep(this.simulatedDelay);
    return this.data.map(filterSummaryInformation);
  }

  async getRetro(retroId) {
    const retroData = await this.findRetroById(retroId);
    if (!retroData) {
      return null;
    }
    return retroData.retro;
  }

  async subscribeRetro(retroId, onChange) {
    const retroData = await this.findRetroById(retroId);
    if (!retroData) {
      return null;
    }

    const { subscriptions } = retroData;
    subscriptions.push(onChange);

    let initialData = retroData.retro;

    return {
      getInitialData: () => {
        const data = initialData;
        initialData = null; // GC
        return data;
      },
      send: (change, meta) => this.internalDistribute(retroData, change, meta),
      close: () => {
        const i = subscriptions.indexOf(onChange);
        subscriptions.splice(i, 1);
      },
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
