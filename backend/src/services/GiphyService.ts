import fetch from 'node-fetch';
import LruCache from '../helpers/LruCache';

interface Config {
  baseUrl: string;
  apiKey: string;
}

interface GifInfo {
  small: string;
  medium: string;
}

export default class GiphyService {
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
    lang: string = 'en',
  ): Promise<GifInfo[]> {
    if (!this.apiKey || !query || limit <= 0) {
      return [];
    }

    const cacheKey = `${lang}:${query}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached && cached.length >= limit) {
      return cached.slice(0, limit);
    }

    const params = new URLSearchParams();
    params.append('api_key', this.apiKey);
    params.append('q', query);
    params.append('limit', String(limit));
    params.append('rating', 'g');
    params.append('lang', lang);
    const result = await fetch(
      `${this.baseUrl}/gifs/search?${params.toString()}`,
    );
    const resultJson = await result.json();

    if (resultJson.status === 400) {
      throw new Error();
    } else if (resultJson.status === 403) {
      process.stderr.write('Warning: Giphy API key rejected\n');
      throw new Error();
    } else if (resultJson.status === 429) {
      process.stderr.write('Warning: Giphy API rate limit reached\n');
      throw new Error();
    } else if (resultJson.status >= 400) {
      process.stderr.write(
        `Warning: Unknown Giphy API response: ${resultJson.status}\n`,
      );
      throw new Error();
    }

    const gifs = resultJson.data.map((gif: any) => ({
      small: gif.images.fixed_height_small.url.split('?')[0],
      medium: gif.images.fixed_height.url.split('?')[0],
    }));

    this.searchCache.set(cacheKey, gifs);

    return gifs;
  }
}
