import type { JsonData, RetroCreationInfo } from '../shared/api-entities';

interface RetroOptions {
  name: string;
  slug: string;
  password: string;
  format: string;
  userToken: string;
  importJson?: JsonData | undefined;
}

export class RetroService {
  constructor(private readonly apiBase: string) {}

  async create({
    name,
    slug,
    password,
    format,
    userToken,
    importJson,
  }: RetroOptions): Promise<RetroCreationInfo> {
    const requestBody: JsonData = { name, slug, password, format };
    if (importJson) {
      requestBody['importJson'] = importJson;
    }
    const response = await fetch(`${this.apiBase}/retros`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
    return body;
  }

  async archive(
    retroId: string,
    retroToken: string,
    preserveRemaining: boolean,
  ): Promise<void> {
    return this._patch(retroId, retroToken, { archive: { preserveRemaining } });
  }

  async setFormat(
    retroId: string,
    retroToken: string,
    format: string,
  ): Promise<void> {
    return this._patch(retroId, retroToken, { setFormat: format });
  }

  async setPassword(
    retroId: string,
    retroToken: string,
    password: string,
    evictUsers: boolean,
  ): Promise<void> {
    return this._patch(retroId, retroToken, {
      setPassword: { password, evictUsers },
    });
  }

  async scheduleDelete(retroId: string, retroToken: string): Promise<void> {
    const response = await fetch(
      `${this.apiBase}/retros/${encodeURIComponent(retroId)}`,
      {
        method: 'DELETE',
        cache: 'no-cache',
        headers: {
          Authorization: `Bearer ${retroToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
  }

  async cancelDelete(retroId: string, retroToken: string): Promise<void> {
    return this._patch(retroId, retroToken, { cancelDelete: true });
  }

  private async _patch(retroId: string, retroToken: string, options: unknown) {
    const response = await fetch(
      `${this.apiBase}/retros/${encodeURIComponent(retroId)}`,
      {
        method: 'PATCH',
        cache: 'no-cache',
        headers: {
          Authorization: `Bearer ${retroToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      },
    );
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
  }
}
