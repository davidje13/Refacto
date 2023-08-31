import hasher from 'pwd-hasher';

// exports from pwd-hasher are not properly compatible with ES6 imports,
// so for now we map the values to maintain type safety:

const unsafeHasher: any = hasher;

export const Hasher: typeof hasher = unsafeHasher.default;
