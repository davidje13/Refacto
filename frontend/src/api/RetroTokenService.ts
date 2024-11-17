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

export class RetroTokenService {
  public constructor(private readonly apiBase: string) {}

  public async getRetroTokenForPassword(
    retroId: string,
    password: string,
  ): Promise<string> {
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
    const body = await handleResponse(response);
    return body.retroToken;
  }

  public async getRetroTokenForUser(
    retroId: string,
    userToken: string,
  ): Promise<string> {
    const response = await fetch(
      `${this.apiBase}/auth/tokens/${encodeURIComponent(retroId)}/user`,
      {
        method: 'GET',
        cache: 'no-cache',
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );
    const body = await handleResponse(response);
    return body.retroToken;
  }
}
