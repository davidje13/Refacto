import { RetroData } from 'refacto-entities';

interface ArchiveOptions {
  retroId: string;
  data: RetroData;
  retroToken: string;
}

export default class ArchiveService {
  public constructor(
    private readonly apiBase: string,
  ) {}

  public async create({
    retroId,
    data,
    retroToken,
  }: ArchiveOptions): Promise<string> {
    const response = await fetch(
      `${this.apiBase}/retros/${retroId}/archives`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          Authorization: `Bearer ${retroToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
    return body.id;
  }
}
