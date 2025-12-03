import { generateKeyPair, createPrivateKey, type KeyLike } from 'node:crypto';
import { promisify } from 'node:util';
import {
  decodeJWT,
  encodeJWT,
  RS256,
  type DecodeOptions,
} from 'authentication-backend';
import type { JsonData } from '../shared/api-entities';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

type GenerateKeyPairCallback = (err: Error | null, keyPair: KeyPair) => void;

const asyncGenerateKeyPair = promisify(
  (
    type: string,
    options: Record<string, unknown>,
    callback: GenerateKeyPairCallback,
  ) =>
    generateKeyPair(
      type as any,
      options as any,
      (err: Error | null, publicKey: string, privateKey: string) => {
        callback(err, { publicKey, privateKey });
      },
    ),
);

export class TokenManager {
  private readonly secretPassphrase: string;

  private readonly modulusLength = 2048;

  private readonly algorithm = RS256;

  public constructor({ secretPassphrase = '' } = {}) {
    this.secretPassphrase = secretPassphrase;
  }

  public generateKeys(): Promise<KeyPair> {
    const secret = this.secretPassphrase;

    return asyncGenerateKeyPair('rsa', {
      modulusLength: this.modulusLength,
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: secret ? 'aes-256-cbc' : undefined,
        passphrase: secret || undefined,
      },
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
    });
  }

  public signData(data: unknown, privateKey: string | Buffer): string {
    return encodeJWT(
      this.algorithm.signer({
        kid: undefined,
        privateKey: createPrivateKey({
          key: privateKey,
          format: 'pem',
          passphrase: this.secretPassphrase,
        }),
      }),
      data,
    );
  }

  public readAndVerifySigned(
    token: string,
    publicKey: KeyLike,
    options: Partial<Omit<DecodeOptions, 'verifyKey'>> = {},
  ): JsonData | null {
    try {
      return decodeJWT(token, {
        verifyIss: false,
        verifyAud: false,
        verifyActive: false,
        ...options,
        verifyKey: this.algorithm.verifier({ kid: undefined, publicKey }),
      }).payload;
    } catch (e) {
      return null;
    }
  }
}
