import crypto from 'crypto';
import util from 'util';
import jwt from 'jwt-simple';

const generateKeyPair = util.promisify(
  (type, options, callback) => crypto.generateKeyPair(
    type,
    options,
    (err, publicKey, privateKey) => callback(err, { publicKey, privateKey }),
  ),
);

export default class TokenManager {
  constructor({ secretPassphrase = '' } = {}) {
    this.secretPassphrase = secretPassphrase;
    this.modulusLength = 2048;
    this.algorithm = 'RS256';
  }

  generateKeys() {
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

  signData(data, privateKey) {
    const key = crypto.createPrivateKey({
      key: privateKey,
      format: 'pem',
      passphrase: this.secretPassphrase,
    });
    return jwt.encode(data, key, this.algorithm, {});
  }

  readAndVerifySigned(token, publicKey) {
    try {
      return jwt.decode(token, publicKey, false, this.algorithm);
    } catch (e) {
      return null;
    }
  }
}
