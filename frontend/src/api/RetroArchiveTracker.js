export default class RetroArchiveTracker {
  constructor(apiBase, retroId, token) {
    this.apiBase = apiBase;
    this.retroId = retroId;
    this.token = token;
    this.archives = new Map();
  }

  load(archiveId, dataCallback) {
    const archiveInfo = this.archives.get(archiveId);
    if (archiveInfo) {
      dataCallback(archiveInfo);
      return;
    }

    const url = `${this.apiBase}/retros/${this.retroId}/archives/${archiveId}`;
    global.fetch(url, { headers: { Authorization: `Bearer ${this.token}` } })
      .then((data) => data.json())
      .then((archive) => ({ archive, error: null }))
      .catch((error) => ({ archive: null, error }))
      .then((data) => {
        this.archives.set(archiveId, data);
        dataCallback(data);
      });
  }
}
