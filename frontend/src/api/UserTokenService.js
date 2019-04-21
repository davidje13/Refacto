export default class UserTokenService {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  async login(service, externalToken, nonce) {
    const response = await fetch(
      `${this.apiBase}/sso/${service}`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalToken, nonce }),
      },
    );
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
    return body.userToken;
  }
}
