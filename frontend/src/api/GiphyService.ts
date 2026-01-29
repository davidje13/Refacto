import { jsonFetch } from './jsonFetch';

export interface GifInfo {
  small: string;
  medium: string;
  alt?: string;
}

export class GiphyService {
  constructor(private readonly apiBase: string) {}

  async search(
    query: string,
    lang: string | undefined,
    signal: AbortSignal,
  ): Promise<GifInfo[]> {
    const normedQuery = query.trim();
    if (!normedQuery) {
      return [];
    }

    const params = new URLSearchParams({ q: normedQuery });
    if (lang) {
      params.set('lang', lang);
    }
    const body = await jsonFetch<{ gifs: GifInfo[] }>(
      `${this.apiBase}/giphy/search?${params}`,
      { signal },
    );
    return body.gifs;
  }
}
