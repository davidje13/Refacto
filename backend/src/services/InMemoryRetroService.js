import update from 'json-immutability-helper';

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

const filterRetroInformation = (retro) => {
  const { archives, ...rest } = retro;

  return {
    archives: archives.map(filterArchiveSummaryInformation),
    ...rest,
  };
};

export default class InMemoryRetroService {
  constructor(initialData = []) {
    this.data = initialData.map((retro) => ({
      retro: filterRetroInformation(retro),
      archives: retro.archives,
      subscriptions: [],
    }));
  }

  async findRetroBySlug(slug) {
    await sleep(300);
    return this.data.find((retroData) => (retroData.retro.slug === slug));
  }

  async findRetroById(id) {
    await sleep(300);
    return this.data.find((retroData) => (retroData.retro.id === id));
  }

  async getRetroIdForSlug(slug) {
    const retroData = await this.findRetroBySlug(slug);
    if (!retroData) {
      return null;
    }
    return retroData.retro.id;
  }

  async getRetroList() {
    await sleep(300);
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
      send: async (change, meta) => {
        await sleep(100);
        retroData.retro = update(retroData.retro, change);
        subscriptions.forEach((sub) => sub(change, meta));
      },
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
