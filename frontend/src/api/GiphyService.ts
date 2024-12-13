import { jsonFetch } from './jsonFetch';

export interface GifInfo {
  small: string;
  medium: string;
}

export class GiphyService {
  public constructor(private readonly apiBase: string) {}

  public async search(query: string, signal: AbortSignal): Promise<GifInfo[]> {
    const normedQuery = query.trim();
    if (!normedQuery) {
      return [];
    }

    const params = new URLSearchParams({ q: normedQuery });
    const body = await jsonFetch<{ gifs: GifInfo[] }>(
      `${this.apiBase}/giphy/search?${params.toString()}`,
      { signal },
    );
    return body.gifs;
  }
}
