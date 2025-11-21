import { jsonFetch } from './jsonFetch';

export class UserTokenService {
  public constructor(private readonly apiBase: string) {}

  public async login(
    service: string,
    externalToken: string,
    redirectUri: string,
    codeVerifier: string | undefined,
    signal: AbortSignal,
  ): Promise<string> {
    const body = await jsonFetch<{ userToken: string }>(
      `${this.apiBase}/sso/${encodeURIComponent(service)}`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalToken, redirectUri, codeVerifier }),
        signal,
      },
    );
    return body.userToken;
  }
}
