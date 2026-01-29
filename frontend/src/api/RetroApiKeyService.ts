import type {
  NewRetroApiKey,
  Retro,
  RetroApiKey,
} from '../shared/api-entities';
import { jsonFetch } from './jsonFetch';

interface RetroApiKeyList {
  apiKeys: RetroApiKey[];
}

interface RetroApiKeyOptions {
  retro: Retro;
  retroToken: string;
  name: string;
  scopes: string[];
}

export class RetroApiKeyService {
  constructor(private readonly apiBase: string) {}

  create({ retro, retroToken, name, scopes }: RetroApiKeyOptions) {
    return jsonFetch<NewRetroApiKey>(
      `${this.apiBase}/retros/${encodeURIComponent(retro.id)}/api-keys`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          Authorization: `Bearer ${retroToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, scopes }),
      },
    );
  }

  getList(
    retroId: string,
    retroToken: string,
    signal: AbortSignal,
  ): Promise<RetroApiKeyList> {
    return jsonFetch(
      `${this.apiBase}/retros/${encodeURIComponent(retroId)}/api-keys`,
      {
        headers: { Authorization: `Bearer ${retroToken}` },
        signal,
      },
    );
  }

  revoke(retroId: string, apiKeyId: string, retroToken: string): Promise<void> {
    return jsonFetch(
      `${this.apiBase}/retros/${encodeURIComponent(retroId)}/api-keys/${encodeURIComponent(apiKeyId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${retroToken}` },
      },
    );
  }
}
