export default class RetroArchiveTracker {
  constructor(apiBase, retroId) {
    this.apiBase = apiBase;
    this.retroId = retroId;
    this.archives = new Map();
  }

  load(archiveId, dataCallback) {
    const archiveInfo = this.archives.get(archiveId);
    if (archiveInfo) {
      dataCallback(archiveInfo);
      return;
    }

    const url = `${this.apiBase}/retros/${this.retroId}/archives/${archiveId}`;
    global.fetch(url)
      .then((data) => data.json())
      .then((archive) => ({ archive, error: null }))
      .catch((error) => ({ archive: null, error }))
      .then((data) => {
        this.archives.set(archiveId, data);
        dataCallback(data);
      });
  }
}
