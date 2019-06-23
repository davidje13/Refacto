declare module 'collection-storage' {
  interface UpdateOptions {
    upsert?: boolean;
  }

  export interface Collection<T> {
    add(entry: T): Promise<void>;
    get(key: string, value: string, columns?: string[]): Promise<T>;
    getAll(key: string, value: string, columns?: string[]): Promise<T[]>;
    update(key: string, value: string, update: Partial<T>, options?: UpdateOptions): Promise<void>;
  }

  interface KeyOptions {
    unique?: boolean;
  }

  export interface DB {
    getCollection<T>(
      name: string,
      keys?: { [K in keyof T]?: KeyOptions },
    ): Collection<T>;
  }

  export class MemoryDb implements DB {
    public getCollection<T>(
      name: string,
      keys?: { [K in keyof T]?: KeyOptions },
    ): Collection<T>;
  }
}
