import type { Observable } from 'rxjs';
import type { RetroArchive } from '../shared/api-entities';
import loadHttp from '../rxjs/loadHttp';

interface RetroArchiveList {
  archives: RetroArchive[];
}

export default class ArchiveTracker {
  public constructor(private readonly apiBase: string) {}

  public getList(
    retroId: string,
    retroToken: string,
  ): Observable<RetroArchiveList> {
    return loadHttp<RetroArchiveList>({
      url: `${this.apiBase}/retros/${retroId}/archives`,
      headers: { Authorization: `Bearer ${retroToken}` },
    });
  }

  public get(
    retroId: string,
    archiveId: string,
    retroToken: string,
  ): Observable<RetroArchive> {
    return loadHttp<RetroArchive>({
      url: `${this.apiBase}/retros/${retroId}/archives/${archiveId}`,
      headers: { Authorization: `Bearer ${retroToken}` },
    });
  }
}
