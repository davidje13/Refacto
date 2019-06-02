export default class ArchiveService {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  async create({
    retroId,
    data,
    retroToken,
  }) {
    const response = await fetch(
      `${this.apiBase}/retros/${retroId}/archives`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          Authorization: `Bearer ${retroToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
    return body.id;
  }
}
