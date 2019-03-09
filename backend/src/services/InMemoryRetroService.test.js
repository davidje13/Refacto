import InMemoryRetroService from './InMemoryRetroService';

describe('InMemoryRetroService', () => {
  let service;

  beforeEach(() => {
    service = new InMemoryRetroService([
      {
        id: 'r1',
        slug: 'my-retro',
        name: 'My Retro',
        state: {},
        data: {
          format: 'something',
          items: [],
        },
        archives: [],
      },
      {
        id: 'r2',
        slug: 'my-second-retro',
        name: 'My Second Retro',
        state: { someRetroSpecificState: true },
        data: {
          format: 'other',
          items: [
            { anItem: 'yes' },
          ],
        },
        archives: [
          { id: 'a1', created: 123, more: 'foo' },
          { id: 'a2', created: 456, more: 'bar' },
        ],
      },
    ]);
  });

  describe('getRetroIdForSlug', () => {
    it('returns a retro ID for the given slug', async () => {
      const id = await service.getRetroIdForSlug('my-second-retro');

      expect(id).toEqual('r2');
    });

    it('returns null if the slug is not found', async () => {
      const id = await service.getRetroIdForSlug('nope');

      expect(id).toEqual(null);
    });
  });

  describe('getRetroList', () => {
    it('returns a list of summarised current retros', async () => {
      const retros = await service.getRetroList();

      expect(retros.length).toEqual(2);
      expect(retros[0]).toEqual({
        id: 'r1',
        slug: 'my-retro',
        name: 'My Retro',
      });
    });
  });

  describe('getRetro', () => {
    it('returns the requested retro by ID', async () => {
      const retro = await service.getRetro('r2');

      expect(retro).not.toBeNull();
      expect(retro.name).toEqual('My Second Retro');
    });

    it('returns full details', async () => {
      const retro = await service.getRetro('r2');

      expect(retro).not.toBeNull();
      expect(retro.data.format).toEqual('other');
      expect(retro.data.items.length).toEqual(1);
      expect(retro.state).toEqual({ someRetroSpecificState: true });
    });

    it('returns summary archive details', async () => {
      const retro = await service.getRetro('r2');

      expect(retro).not.toBeNull();
      expect(retro.archives.length).toEqual(2);
      expect(retro.archives[0]).toEqual({ id: 'a1', created: 123 });
    });

    it('returns null if the ID is not found', async () => {
      const retro = await service.getRetro('nope');

      expect(retro).toBeNull();
    });
  });

  describe('getRetroArchive', () => {
    it('returns the requested retro archive by ID', async () => {
      const archive = await service.getRetroArchive('r2', 'a1');

      expect(archive).not.toBeNull();
      expect(archive.created).toEqual(123);
    });

    it('returns null if the archive is not in the retro', async () => {
      const archive = await service.getRetroArchive('r1', 'a1');

      expect(archive).toBeNull();
    });
  });
});
