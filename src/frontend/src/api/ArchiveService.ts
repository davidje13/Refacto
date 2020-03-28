import type { Retro, RetroData } from 'refacto-entities';

interface ArchiveOptions {
  retro: Retro;
  retroToken: string;
}

export default class ArchiveService {
  public constructor(
    private readonly apiBase: string,
  ) {}

  public async create({
    retro,
    retroToken,
  }: ArchiveOptions): Promise<string> {
    const retroData: RetroData = {
      format: retro.format,
      options: retro.options,
      items: retro.items,
    };
    const response = await fetch(
      `${this.apiBase}/retros/${retro.id}/archives`,
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
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
    return body.id;
  }
}
