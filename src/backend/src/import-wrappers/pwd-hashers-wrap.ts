import h from 'pwd-hasher';
import type HasherT from 'pwd-hasher';

// exports from pwd-hasher are not properly compatible with ES6 imports,
// so for now we map the values to maintain type safety:

const unsafeHasher: any = h;

export const Hasher: typeof HasherT = unsafeHasher.default;
