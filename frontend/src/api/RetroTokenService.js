export default class RetroTokenService {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  async submitPassword(retroId, password) {
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
    return body.token;
  }
}
