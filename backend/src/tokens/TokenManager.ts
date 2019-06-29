import crypto, { KeyObject } from 'crypto';
import util from 'util';
import jwt from 'jwt-simple';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

type GenerateKeyPairCallback = (err: Error | null, keyPair: KeyPair) => void;

const generateKeyPair = util.promisify(
  (
    type: string,
    options: object,
    callback: GenerateKeyPairCallback,
  ): void => crypto.generateKeyPair(
    type as any,
    options as any,
    (err: Error | null, publicKey: string, privateKey: string): void => {
      callback(err, { publicKey, privateKey });
    },
  ),
);

export default class TokenManager {
  private readonly secretPassphrase: string;

  private readonly modulusLength = 2048;

  private readonly algorithm = 'RS256';

  public constructor({ secretPassphrase = '' } = {}) {
    this.secretPassphrase = secretPassphrase;
  }

  public generateKeys(): Promise<KeyPair> {
    return generateKeyPair('rsa', {
      modulusLength: this.modulusLength,
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: this.secretPassphrase,
      },
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
    });
  }

  public signData(data: object, privateKey: string | Buffer): string {
    const key = crypto.createPrivateKey({
      key: privateKey,
      format: 'pem',
      passphrase: this.secretPassphrase,
    });
    return jwt.encode(data, key as any, this.algorithm);
  }

  public readAndVerifySigned(token: string, publicKey: string | KeyObject): object | null {
    try {
      return jwt.decode(token, publicKey as any, false, this.algorithm);
    } catch (e) {
      return null;
    }
  }
}