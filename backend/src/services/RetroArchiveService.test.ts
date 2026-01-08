import { randomBytes } from 'node:crypto';
import { MemoryDB } from 'collection-storage';
import { RetroArchiveService } from './RetroArchiveService';

describe('RetroArchiveService', () => {
  let service: RetroArchiveService;
  let a1: string;

  beforeEach(async () => {
    const db = MemoryDB.connect('memory://');
    service = new RetroArchiveService(db, randomBytes(32));
    a1 = await service.createArchive('my-retro-id', {
      format: 'foo',
      options: { a: 'x' },
      items: [],
    });
    await service.createArchive('my-retro-id', {
      format: 'bar',
      options: {},
      items: [],
    });
  });

  describe('getRetroArchive', () => {
    it('returns the requested retro archive by ID', async () => {
      const archive = await service.getRetroArchive('my-retro-id', a1);

      expect(archive).not(toBeNull());
      expect(archive?.format).toEqual('foo');
      expect(archive?.options['a']).toEqual('x');
    });

    it('returns null if the archive is not in the retro', async () => {
      const archive = await service.getRetroArchive('nope', a1);

      expect(archive).toBeNull();
    });

    it('returns null if the archive ID does not exist', async () => {
      const archive = await service.getRetroArchive('my-retro-id', 'nope');

      expect(archive).toBeNull();
    });
  });
});
