export default class RetroService {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  async create({ name, slug, password }) {
    const response = await fetch(
      `${this.apiBase}/retros`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, password }),
      },
    );
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
    return body.id;
  }
}
