import type { RetroArchive } from '../shared/api-entities';
import { jsonFetch } from './jsonFetch';

interface RetroArchiveList {
  archives: RetroArchive[];
}

export class ArchiveService {
  constructor(private readonly apiBase: string) {}

  getList(
    retroId: string,
    retroToken: string,
    signal: AbortSignal,
  ): Promise<RetroArchiveList> {
    return jsonFetch(
      `${this.apiBase}/retros/${encodeURIComponent(retroId)}/archives`,
      {
        headers: { Authorization: `Bearer ${retroToken}` },
        signal,
      },
    );
  }

  get(
    retroId: string,
    archiveId: string,
    retroToken: string,
    signal: AbortSignal,
  ): Promise<RetroArchive> {
    return jsonFetch(
      `${this.apiBase}/retros/${encodeURIComponent(retroId)}/archives/${encodeURIComponent(archiveId)}`,
      {
        headers: { Authorization: `Bearer ${retroToken}` },
        signal,
      },
    );
  }
}
