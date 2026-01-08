import { LruCache } from 'collection-storage';

interface Config {
  baseUrl: string;
  apiKey: string;
}

interface GifInfo {
  small: string;
  medium: string;
  alt: string | undefined;
}

interface GiphyResponseResource {
  url?: string;
  webp?: string;
}

interface GiphyResponseGif {
  alt_text?: string;
  images: {
    original?: GiphyResponseResource;
    fixed_height?: GiphyResponseResource;
    fixed_height_small?: GiphyResponseResource;
    fixed_height_downsampled?: GiphyResponseResource;
    fixed_width?: GiphyResponseResource;
    fixed_width_small?: GiphyResponseResource;
    fixed_width_downsampled?: GiphyResponseResource;
  };
}

export interface GiphyResponse {
  meta: { status: number };
  data: GiphyResponseGif[];
  pagination: { total_count?: number };
}

export class GiphyService {
  private readonly baseUrl: string;

  private readonly apiKey: string;

  // memory used = ~200 bytes per gif entry * max limit * cache size
  private readonly searchCache = new LruCache<string, GifInfo[]>(256);

  public constructor(config: Config) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  public async search(
    query: string,
    offset: number,
    limit: number,
    lang?: string | undefined,
  ): Promise<GifInfo[]> {
    if (!this.apiKey || !query || offset < 0 || limit <= 0) {
      return [];
    }

    const cacheKey = `${lang}:${query}:${offset}:${limit}`;

    return this.searchCache.cachedAsync(cacheKey, async () => {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        q: query,
        offset: String(offset),
        limit: String(limit),
        rating: 'g',
        bundle: 'messaging_non_clips',
      });
      if (lang) {
        params.set('lang', lang);
      }
      const result = await fetch(`${this.baseUrl}/gifs/search?${params}`);
      const resultJson = (await result.json()) as GiphyResponse;
      const status = resultJson.meta?.status || result.status;

      if (status === 400) {
        throw new Error('Giphy API returned Bad Request');
      } else if (status === 403) {
        throw new Error('Giphy API key rejected');
      } else if (status === 429) {
        throw new Error('Giphy API rate limit reached');
      } else if (status >= 400) {
        throw new Error(`Unknown Giphy API response: ${status}`);
      }

      return resultJson.data.map((gif) => {
        const original = getResourceURL(gif.images.original);
        const medium = getResourceURL(gif.images.fixed_height);
        const small = getResourceURL(gif.images.fixed_height_small);
        return {
          small: trimQuery(small ?? medium ?? original) ?? '',
          medium: trimQuery(medium ?? original ?? small) ?? '',
          alt: gif.alt_text || undefined,
        };
      });
    });
  }
}

const getResourceURL = (image: GiphyResponseResource | undefined) =>
  image?.webp ?? image?.url;

function trimQuery(href: string | undefined) {
  if (!href) {
    return undefined;
  }
  try {
    const url = new URL(href);
    url.search = '';
    return url.toString();
  } catch {
    return href.split('?')[0] ?? '';
  }
}
