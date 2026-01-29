import type { Retro, RetroArchive, RetroData } from '../shared/api-entities';
import { jsonFetch } from './jsonFetch';

interface RetroArchiveList {
  archives: RetroArchive[];
}

interface ArchiveOptions {
  retro: Retro;
  retroToken: string;
}

export class ArchiveService {
  constructor(private readonly apiBase: string) {}

  async create({ retro, retroToken }: ArchiveOptions): Promise<string> {
    const retroData: RetroData = {
      format: retro.format,
      options: retro.options,
      items: retro.items,
    };
    const body = await jsonFetch<{ id: string }>(
      `${this.apiBase}/retros/${encodeURIComponent(retro.id)}/archives`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          Authorization: `Bearer ${retroToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(retroData),
      },
    );
    return body.id;
  }

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
