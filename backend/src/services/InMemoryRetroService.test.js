import InMemoryRetroService from './InMemoryRetroService';

describe('InMemoryRetroService', () => {
  let service;
  let r1;
  let r2;

  beforeEach(async () => {
    service = new InMemoryRetroService();
    r1 = await service.createRetro(
      'me',
      'my-retro',
      'My Retro',
      'something',
    );
    r2 = await service.createRetro(
      'nobody',
      'my-second-retro',
      'My Second Retro',
      'other',
      {
        state: { someRetroSpecificState: true },
        items: [
          { anItem: 'yes' },
        ],
        archives: [
          { id: 'a1', created: 123, more: 'foo' },
          { id: 'a2', created: 456, more: 'bar' },
        ],
      },
    );
  });

  describe('getRetroIdForSlug', () => {
    it('returns a retro ID for the given slug', async () => {
      const id = await service.getRetroIdForSlug('my-second-retro');

      expect(id).toEqual(r2);
    });

    it('returns null if the slug is not found', async () => {
      const id = await service.getRetroIdForSlug('nope');

      expect(id).toEqual(null);
    });
  });

  describe('getRetroListForUser', () => {
    it('returns a list of summarised retros for the user', async () => {
      const retros = await service.getRetroListForUser('me');

      expect(retros.length).toEqual(1);
      expect(retros[0]).toEqual({
        id: r1,
        slug: 'my-retro',
        name: 'My Retro',
      });
    });
  });

  describe('subscribeRetro', () => {
    it('returns the requested retro by ID', async () => {
      const subscription = await service.subscribeRetro(r2, () => {});
      const retro = subscription.getInitialData();
      subscription.close();

      expect(retro).not.toBeNull();
      expect(retro.name).toEqual('My Second Retro');
    });

    it('returns full details', async () => {
      const subscription = await service.subscribeRetro(r2, () => {});
      const retro = subscription.getInitialData();
      subscription.close();

      expect(retro).not.toBeNull();
      expect(retro.data.format).toEqual('other');
      expect(retro.data.items.length).toEqual(1);
      expect(retro.state).toEqual({ someRetroSpecificState: true });
    });

    it('returns summary archive details', async () => {
      const subscription = await service.subscribeRetro(r2, () => {});
      const retro = subscription.getInitialData();
      subscription.close();

      expect(retro).not.toBeNull();
      expect(retro.archives.length).toEqual(2);
      expect(retro.archives[0]).toEqual({ id: 'a1', created: 123 });
    });

    it('returns null if the ID is not found', async () => {
      const subscription = await service.subscribeRetro('nope', () => {});

      expect(subscription).toBeNull();
    });
  });

  describe('getRetroArchive', () => {
    it('returns the requested retro archive by ID', async () => {
      const archive = await service.getRetroArchive(r2, 'a1');

      expect(archive).not.toBeNull();
      expect(archive.created).toEqual(123);
    });

    it('returns null if the archive is not in the retro', async () => {
      const archive = await service.getRetroArchive(r1, 'a1');

      expect(archive).toBeNull();
    });
  });
});
