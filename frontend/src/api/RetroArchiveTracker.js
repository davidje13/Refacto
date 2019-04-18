import { shareReplay, materialize } from 'rxjs/operators';
import loadHttp from '../rxjs/loadHttp';
import CacheMap from '../helpers/CacheMap';

export default class RetroArchiveTracker extends CacheMap {
  constructor(apiBase, retroId, token) {
    super((archiveId) => loadHttp({
      url: `${apiBase}/retros/${retroId}/archives/${archiveId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).pipe(
      shareReplay(1),
      materialize(),
    ));
  }
}
