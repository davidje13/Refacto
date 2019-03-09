function sleep(millis) {
  // Simulate data access delays to ensure non-flakey e2e tests, etc.
  return new Promise((resolve) => setTimeout(resolve, millis));
}

const filterSummaryInformation = ({ id, slug, name }) => ({ id, slug, name });
const filterArchiveSummaryInformation = ({ id, created }) => ({ id, created });

const filterRetroInformation = (retro) => {
  const { archives, ...rest } = retro;

  return {
    archives: archives.map(filterArchiveSummaryInformation),
    ...rest,
  };
};

export default class InMemoryRetroService {
  constructor(initialData = []) {
    this.data = initialData;
  }

  findRetroBySlug(slug) {
    return this.data.find((retro) => (retro.slug === slug));
  }

  findRetroById(id) {
    return this.data.find((retro) => (retro.id === id));
  }

  async getRetroIdForSlug(slug) {
    await sleep(300);
    const retro = this.findRetroBySlug(slug);
    if (!retro) {
      return null;
    }
    return retro.id;
  }

  async getRetroList() {
    await sleep(300);
    return this.data.map(filterSummaryInformation);
  }

  async getRetro(retroid) {
    await sleep(300);
    const retro = this.findRetroById(retroid);
    if (!retro) {
      return null;
    }
    return filterRetroInformation(retro);
  }

  async getRetroArchive(retroid, archiveid) {
    await sleep(300);
    const retro = this.findRetroById(retroid);
    if (!retro) {
      return null;
    }
    return retro.archives.find((archive) => (archive.id === archiveid)) || null;
  }
}
