import loadHttp from '../rxjs/loadHttp';

export default class ArchiveTracker {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  getList(retroId, retroToken) {
    return loadHttp({
      url: `${this.apiBase}/retros/${retroId}/archives`,
      headers: { Authorization: `Bearer ${retroToken}` },
    });
  }

  get(retroId, archiveId, retroToken) {
    return loadHttp({
      url: `${this.apiBase}/retros/${retroId}/archives/${archiveId}`,
      headers: { Authorization: `Bearer ${retroToken}` },
    });
  }
}
