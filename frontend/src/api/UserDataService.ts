import type { UserData } from '../shared/api-entities';
import { jsonFetch } from './jsonFetch';

export class UserDataService {
  constructor(private readonly apiBase: string) {}

  login(
    service: string,
    externalToken: string,
    redirectUri: string,
    codeVerifier: string | undefined,
    signal: AbortSignal,
  ): Promise<UserData> {
    return jsonFetch<UserData>(
      `${this.apiBase}/sso/${encodeURIComponent(service)}`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalToken, redirectUri, codeVerifier }),
        signal,
      },
    );
  }
}
