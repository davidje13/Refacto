declare module 'collection-storage';

interface Collection<T> {
  add(entry: T): Promise<void>;
  get(key: string, value: string): Promise<T>;
  getAll(key: string, value: string, columns: string[]): Promise<T[]>;
}

interface KeyOptions {
  unique?: boolean;
}

interface DB {
  getCollection<T>(name: string, keys: { [key: string]: KeyOptions }): Collection<T>;
}
