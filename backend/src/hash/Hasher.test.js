import Hasher from './Hasher';

describe('Hasher', () => {
  const hasher = new Hasher({ workFactor: 4 });

  describe('hash', () => {
    it('returns an ASCII-safe hash', async () => {
      const hash = await hasher.hash('abc');

      expect(hash).toEqual(expect.stringMatching(/^[ -~]+$/));
    });

    it('generates different hashes for different inputs', async () => {
      const hash1 = await hasher.hash('abc');
      const hash2 = await hasher.hash('def');

      expect(hash1).not.toEqual(hash2);
    });

    it('generates different hashes for the same input', async () => {
      const hash1 = await hasher.hash('abc');
      const hash2 = await hasher.hash('abc');

      expect(hash1).not.toEqual(hash2);
    });
  });

  describe('compare', () => {
    it('returns true for hashes of the same input', async () => {
      const hash = await hasher.hash('abc');

      expect(await hasher.compare('abc', hash)).toEqual(true);
    });

    it('returns false for hashes of a different input', async () => {
      const hash = await hasher.hash('abc');

      expect(await hasher.compare('nope', hash)).toEqual(false);
    });

    it('does not truncate long inputs', async () => {
      const prefix = '0'.repeat(72);
      const hash = await hasher.hash(`${prefix}1`);

      expect(await hasher.compare(`${prefix}1`, hash)).toEqual(true);
      expect(await hasher.compare(`${prefix}2`, hash)).toEqual(false);
    });

    it('uses the number of rounds from the hashed value', async () => {
      const hasher2 = new Hasher({ workFactor: 100 });
      const hash = await hasher.hash('abc');

      expect(await hasher2.compare('abc', hash)).toEqual(true);
      expect(await hasher2.compare('nope', hash)).toEqual(false);
    });

    it('returns false for hashes with a different pepper', async () => {
      const hasher1 = new Hasher({ secretPepper: 'pepper1', workFactor: 4 });
      const hasher2 = new Hasher({ secretPepper: 'pepper2', workFactor: 4 });
      const hash = await hasher1.hash('abc');

      expect(await hasher2.compare('abc', hash)).toEqual(false);
    });
  });

  describe('needsRegenerate', () => {
    it('returns true if the hash uses too few rounds', async () => {
      const hasher1 = new Hasher({ workFactor: 4 });
      const hasher2 = new Hasher({ workFactor: 6 });
      const hash = await hasher1.hash('abc');

      expect(hasher2.needsRegenerate(hash)).toEqual(true);
    });

    it('returns false if the hash uses sufficient rounds', async () => {
      const hasher1 = new Hasher({ workFactor: 8 });
      const hasher2 = new Hasher({ workFactor: 6 });
      const hash = await hasher1.hash('abc');

      expect(hasher1.needsRegenerate(hash)).toEqual(false);
      expect(hasher2.needsRegenerate(hash)).toEqual(false);
    });
  });
});
