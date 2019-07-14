export default class RetroTokenService {
  public constructor(
    private readonly apiBase: string,
  ) {}

  public async submitPassword(
    retroId: string,
    password: string,
  ): Promise<string> {
    const response = await fetch(
      `${this.apiBase}/auth/tokens/${retroId}`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      },
    );
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
    return body.retroToken;
  }
}
