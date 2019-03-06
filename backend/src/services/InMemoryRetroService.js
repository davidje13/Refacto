function sleep(millis) {
  // Simulate data access delays to ensure non-flakey e2e tests, etc.
  return new Promise((resolve) => setTimeout(resolve, millis));
}

const filterSummaryInformation = ({ uuid, slug, name }) => ({ uuid, slug, name });
const filterArchiveSummaryInformation = ({ uuid, created }) => ({ uuid, created });

const filterRetroInformation = (retro) => {
  const { archives, ...rest } = retro;

  return {
    archives: archives.map(filterArchiveSummaryInformation),
    ...rest,
  };
};

function findArchiveById(retro, uuid) {
  return retro.archives.find((archive) => (archive.uuid === uuid));
}

export default class InMemoryRetroService {
  constructor(initialData = []) {
    this.data = initialData;
  }

  findRetroBySlug(slug) {
    return this.data.find((retro) => (retro.slug === slug));
  }

  findRetroById(uuid) {
    return this.data.find((retro) => (retro.uuid === uuid));
  }

  async getRetroIdForSlug(slug) {
    await sleep(300);
    const retro = this.findRetroBySlug(slug);
    if (!retro) {
      return null;
    }
    return retro.uuid;
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
    const archive = findArchiveById(retro, archiveid);
    if (!archive) {
      return null;
    }
    return Object.assign({
      retro: filterSummaryInformation(retro),
    }, archive);
  }
}
