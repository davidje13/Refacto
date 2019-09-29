import TokenManager, { KeyPair } from './TokenManager';

const JWT_PATTERN = /^([a-zA-Z0-9_-]+(\.|$)){3}$/;

describe('TokenManager', () => {
  const manager = new TokenManager();
  const data = { foo: 'bar' };
  let keys: KeyPair;

  beforeAll(async () => {
    keys = await manager.generateKeys();
  });

  describe('generateKeys', () => {
    it('returns keys in ASCII-safe format', () => {
      expect(keys.privateKey).toEqual(expect.stringMatching(/^[ -~\n]+$/));
      expect(keys.publicKey).toEqual(expect.stringMatching(/^[ -~\n]+$/));
    });

    it('returns different keys each time', async () => {
      const keys2 = await manager.generateKeys();

      expect(keys.privateKey).not.toEqual(keys2.privateKey);
      expect(keys.publicKey).not.toEqual(keys2.publicKey);
    });
  });

  describe('signData', () => {
    it('generates tokens in JWT format', async () => {
      const token = manager.signData(data, keys.privateKey);

      expect(token).toEqual(expect.stringMatching(JWT_PATTERN));
    });

    it('produces the same signature for the same input', async () => {
      const token1 = manager.signData(data, keys.privateKey);
      const token2 = manager.signData(data, keys.privateKey);

      expect(token1).toEqual(token2);
    });

    it('produces different signatures for the different input', async () => {
      const token1 = manager.signData(data, keys.privateKey);
      const token2 = manager.signData({ foo: 'other' }, keys.privateKey);

      expect(token1).not.toEqual(token2);
    });

    it('produces different signatures for different keys', async () => {
      const keys2 = await manager.generateKeys();

      const token1 = manager.signData(data, keys.privateKey);
      const token2 = manager.signData(data, keys2.privateKey);

      expect(token1).not.toEqual(token2);
    });

    it('uses the passphrase to encrypt private keys at rest', async () => {
      const config = { secretPassphrase: 'my-passphrase' };
      const passManager1 = new TokenManager(config);
      const passManager2 = new TokenManager(config);
      const passKeys = await passManager1.generateKeys();

      const token1 = passManager1.signData(data, passKeys.privateKey);
      const token2 = passManager2.signData(data, passKeys.privateKey);

      expect(token1).toEqual(token2);
      expect(() => manager.signData(data, passKeys.privateKey)).toThrow();
    });
  });

  describe('readAndVerifySigned', () => {
    it('returns the original data if the signature matches', async () => {
      const token = manager.signData(data, keys.privateKey);
      const extracted = manager.readAndVerifySigned(token, keys.publicKey);

      expect(extracted).toEqual(data);
    });

    it('returns null if the signature does not match', async () => {
      const keys2 = await manager.generateKeys();

      const token = manager.signData(data, keys.privateKey);
      const extracted = manager.readAndVerifySigned(token, keys2.publicKey);

      expect(extracted).toEqual(null);
    });

    it('returns null if the token is empty', async () => {
      const extracted = manager.readAndVerifySigned('', keys.publicKey);

      expect(extracted).toEqual(null);
    });

    it('returns null if the token is malformed', async () => {
      const extracted = manager.readAndVerifySigned('nope', keys.publicKey);

      expect(extracted).toEqual(null);
    });
  });
});
