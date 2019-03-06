import InMemoryRetroService from './InMemoryRetroService';

describe('InMemoryRetroService', () => {
  let service;

  beforeEach(() => {
    service = new InMemoryRetroService([
      {
        uuid: 'r1',
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
        uuid: 'r2',
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
          { uuid: 'a1', created: 123, more: 'foo' },
          { uuid: 'a2', created: 456, more: 'bar' },
        ],
      },
    ]);
  });

  describe('getRetroIdForSlug', () => {
    it('returns a retro UUID for the given slug', async () => {
      const uuid = await service.getRetroIdForSlug('my-second-retro');

      expect(uuid).toEqual('r2');
    });

    it('returns null if the slug is not found', async () => {
      const uuid = await service.getRetroIdForSlug('nope');

      expect(uuid).toEqual(null);
    });
  });

  describe('getRetroList', () => {
    it('returns a list of summarised current retros', async () => {
      const retros = await service.getRetroList();

      expect(retros.length).toEqual(2);
      expect(retros[0]).toEqual({
        uuid: 'r1',
        slug: 'my-retro',
        name: 'My Retro',
      });
    });
  });

  describe('getRetro', () => {
    it('returns the requested retro by uuid', async () => {
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
      expect(retro.archives[0]).toEqual({ uuid: 'a1', created: 123 });
    });

    it('returns null if the UUID is not found', async () => {
      const retro = await service.getRetro('nope');

      expect(retro).toBeNull();
    });
  });

  describe('getRetroArchive', () => {
    it('returns the requested retro archive by uuid', async () => {
      const archive = await service.getRetroArchive('r2', 'a1');

      expect(archive).not.toBeNull();
      expect(archive.created).toEqual(123);
    });

    it('includes summary retro details', async () => {
      const archive = await service.getRetroArchive('r2', 'a1');

      expect(archive).not.toBeNull();
      expect(archive.retro).toEqual({
        uuid: 'r2',
        slug: 'my-second-retro',
        name: 'My Second Retro',
      });
    });

    it('returns null if the archive is not in the retro', async () => {
      const archive = await service.getRetroArchive('r1', 'a1');

      expect(archive).toBeNull();
    });
  });
});
