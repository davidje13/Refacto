import { AsyncValue } from '../helpers/AsyncValue';
import { CacheMap } from '../helpers/CacheMap';
import { jsonFetch } from './jsonFetch';

export class SlugTracker {
  private readonly storage: CacheMap<string, AsyncValue<string, Error>>;

  public constructor(apiBase: string) {
    this.storage = new CacheMap((slug: string) =>
      AsyncValue.withProducer((signal) =>
        jsonFetch<{ id: string }>(
          `${apiBase}/slugs/${encodeURIComponent(slug)}`,
          { signal },
        ).then(({ id }) => id),
      ),
    );
  }

  public get(slug: string) {
    return this.storage.get(slug);
  }

  public set(slug: string, id: string) {
    this.storage.get(slug).set(id);
  }

  public remove(slug: string) {
    this.storage.remove(slug);
  }

  public async isAvailable(slug: string): Promise<boolean> {
    const [, err] = await this.get(slug).getOneState();
    if (!err) {
      return false;
    } else if (err.message === 'not found') {
      return true;
    } else {
      throw err;
    }
  }
}
