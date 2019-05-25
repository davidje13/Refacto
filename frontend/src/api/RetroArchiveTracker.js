import { shareReplay, materialize } from 'rxjs/operators';
import loadHttp from '../rxjs/loadHttp';
import CacheMap from '../helpers/CacheMap';

export default class RetroArchiveTracker extends CacheMap {
  constructor(apiBase, retroId, retroToken) {
    super((archiveId) => loadHttp({
      url: `${apiBase}/retros/${retroId}/archives/${archiveId}`,
      headers: { Authorization: `Bearer ${retroToken}` },
    }).pipe(
      shareReplay(1),
      materialize(),
    ));

    this.apiBase = apiBase;
    this.retroId = retroId;
    this.retroToken = retroToken;
  }

  getList() {
    return loadHttp({
      url: `${this.apiBase}/retros/${this.retroId}/archives`,
      headers: { Authorization: `Bearer ${this.retroToken}` },
    });
  }
}
