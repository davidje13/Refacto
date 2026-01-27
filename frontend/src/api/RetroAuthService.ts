import type { RetroAuth } from '../shared/api-entities';

async function handleResponse(response: Response): Promise<any> {
  try {
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
    return body;
  } catch (e) {
    throw new Error('Connection failed');
  }
}

export class RetroAuthService {
  public constructor(private readonly apiBase: string) {}

  public async getRetroAuthForPassword(
    retroId: string,
    password: string,
  ): Promise<RetroAuth> {
    const response = await fetch(
      `${this.apiBase}/auth/tokens/${encodeURIComponent(retroId)}`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      },
    );
    if (response.status === 400) {
      throw new Error('Incorrect password');
    }
    return handleResponse(response);
  }

  public async getRetroAuthForApiKey(
    retroId: string,
    apiKey: string,
    signal: AbortSignal,
  ): Promise<RetroAuth> {
    const response = await fetch(
      `${this.apiBase}/auth/tokens/${encodeURIComponent(retroId)}/api-key`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
        signal,
      },
    );
    if (response.status === 400) {
      throw new Error('Invalid key');
    }
    return handleResponse(response);
  }

  public async getRetroAuthForUser(
    retroId: string,
    userToken: string,
    signal: AbortSignal,
  ): Promise<RetroAuth> {
    const response = await fetch(
      `${this.apiBase}/auth/tokens/${encodeURIComponent(retroId)}/user`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        signal,
      },
    );
    return handleResponse(response);
  }
}
