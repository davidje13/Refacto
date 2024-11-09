declare module 'jwt-simple' {
  import { KeyLike } from 'node:crypto';

  export type TAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256';

  export interface IOptions {
    header: any;
  }

  function decode(
    token: string,
    key: string | Buffer,
    noVerify?: boolean,
    algorithm?: TAlgorithm,
  ): any;

  // https://github.com/hokaccha/node-jwt-simple/pull/98/files
  function decode(token: string, key: KeyLike, noVerify: true): any;

  function decode(
    token: string,
    key: KeyLike,
    noVerify: boolean,
    algorithm: TAlgorithm,
  ): any;

  function encode(
    payload: any,
    key: KeyLike,
    algorithm?: TAlgorithm,
    options?: IOptions,
  ): string;

  const jwt: {
    decode: typeof decode;
    encode: typeof encode;
  };

  export default jwt;
}
