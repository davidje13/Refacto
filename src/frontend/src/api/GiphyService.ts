export interface GifInfo {
  small: string;
  medium: string;
}

export class GiphyService {
  public constructor(private readonly apiBase: string) {}

  public async search(query: string): Promise<GifInfo[]> {
    const normedQuery = query.trim();
    if (!normedQuery) {
      return [];
    }

    const params = new URLSearchParams();
    params.append('q', normedQuery);
    const response = await fetch(
      `${this.apiBase}/giphy/search?${params.toString()}`,
    );
    const body = await response.json();

    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }

    return body.gifs;
  }
}
