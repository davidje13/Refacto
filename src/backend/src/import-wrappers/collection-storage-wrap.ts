import cs from 'collection-storage';
import type {
  default as cst,
  LruCache as LruCacheT,
  MemoryDb as MemoryDbT,
  migrate as migrateT,
  encryptByRecordWithMasterKey as encryptByRecordWithMasterKeyT,
} from 'collection-storage';

// exports from collection-storage are not properly compatible with ES6 imports,
// so for now we map the values to maintain type safety:

const unsafeCS: any = cs;

export const connectDB: (typeof cst)['connect'] = unsafeCS.default.connect;
export const LruCache: typeof LruCacheT = unsafeCS.LruCache;
export const MemoryDb: typeof MemoryDbT = unsafeCS.MemoryDb;
export const migrate: typeof migrateT = unsafeCS.migrate;
export const encryptByRecordWithMasterKey: typeof encryptByRecordWithMasterKeyT =
  unsafeCS.encryptByRecordWithMasterKey;
