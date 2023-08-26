// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
/// <reference lib="dom" />

import { LruCache } from '../import-wrappers/collection-storage-wrap';

interface Config {
  baseUrl: string;
  apiKey: string;
}

interface GifInfo {
  small: string;
  medium: string;
}

interface GiphyResponseResource {
  url: string;
}

interface GiphyResponseGif {
  images: {
    fixed_height: GiphyResponseResource;
    fixed_height_small: GiphyResponseResource;
  };
}

interface GiphyResponse {
  status: number;
  data: ReadonlyArray<GiphyResponseGif>;
}

export class GiphyService {
  private readonly baseUrl: string;

  private readonly apiKey: string;

  // memory used = ~120 bytes per gif entry * max limit * max cache size
  private readonly searchCache = new LruCache<string, GifInfo[]>(1024);

  public constructor(config: Config) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  public async search(
    query: string,
    limit: number,
    lang = 'en',
  ): Promise<GifInfo[]> {
    if (!this.apiKey || !query || limit <= 0) {
      return [];
    }

    const cached = await this.searchCache.cachedAsync(
      `${lang}:${query}`,
      async (): Promise<GifInfo[]> => {
        const params = new URLSearchParams();
        params.append('api_key', this.apiKey);
        params.append('q', query);
        params.append('limit', String(limit));
        params.append('rating', 'g');
        params.append('lang', lang);
        const result = await fetch(
          `${this.baseUrl}/gifs/search?${params.toString()}`,
        );
        const resultJson = (await result.json()) as GiphyResponse;

        if (resultJson.status === 400) {
          throw new Error('Giphy API returned Bad Request');
        } else if (resultJson.status === 403) {
          throw new Error('Giphy API key rejected');
        } else if (resultJson.status === 429) {
          throw new Error('Giphy API rate limit reached');
        } else if (resultJson.status >= 400) {
          throw new Error(`Unknown Giphy API response: ${resultJson.status}`);
        }

        return resultJson.data.map((gif) => ({
          small: gif.images.fixed_height_small.url.split('?')[0] ?? '',
          medium: gif.images.fixed_height.url.split('?')[0] ?? '',
        }));
      },
      (c) => c.length >= limit,
    );
    return cached.slice(0, limit);
  }
}
