import { AsyncValue } from '../helpers/AsyncValue';
import { CacheMap } from '../helpers/CacheMap';
import { jsonFetch } from './jsonFetch';

export class SlugTracker {
  declare private readonly storage: CacheMap<string, AsyncValue<string, Error>>;

  constructor(apiBase: string) {
    this.storage = new CacheMap((slug: string) =>
      AsyncValue.withProducer((signal) =>
        jsonFetch<{ id: string }>(
          `${apiBase}/slugs/${encodeURIComponent(slug)}`,
          { signal },
        ).then(({ id }) => id),
      ),
    );
  }

  get(slug: string) {
    return this.storage.get(slug);
  }

  set(slug: string, id: string) {
    this.storage.get(slug).set(id);
  }

  remove(slug: string) {
    this.storage.remove(slug);
  }

  async isAvailable(slug: string): Promise<boolean> {
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
