export default class UserTokenService {
  public constructor(
    private readonly apiBase: string,
  ) {}

  public async login(
    service: string,
    externalToken: string,
  ): Promise<string> {
    const response = await fetch(`${this.apiBase}/sso/${service}`, {
      method: 'POST',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ externalToken }),
    });
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
    return body.userToken;
  }
}
