import InMemoryRetroService from './InMemoryRetroService';

describe('InMemoryRetroService', () => {
  let service;

  beforeEach(() => {
    service = new InMemoryRetroService([
      {
        slug: 'my-retro',
        name: 'My Retro',
        format: 'something',
        state: {},
        items: [],
      },
      {
        slug: 'my-second-retro',
        name: 'My Second Retro',
        format: 'other',
        state: { someRetroSpecificState: true },
        items: [
          { anItem: 'yes' },
        ],
      },
    ]);
  });

  describe('getRetros', () => {
    it('returns a list of summarised current retros', async () => {
      const retros = await service.getRetros();

      expect(retros.length).toEqual(2);
      expect(retros[0]).toEqual({
        slug: 'my-retro',
        name: 'My Retro',
      });
    });
  });

  describe('getRetro', () => {
    it('returns the requested retro by slug', async () => {
      const retro = await service.getRetro('my-second-retro');

      expect(retro).not.toBeNull();
      expect(retro.name).toEqual('My Second Retro');
    });

    it('returns full details', async () => {
      const retro = await service.getRetro('my-second-retro');

      expect(retro).not.toBeNull();
      expect(retro.format).toEqual('other');
      expect(retro.items.length).toEqual(1);
      expect(retro.state).toEqual({ someRetroSpecificState: true });
    });

    it('returns null if the slug is not found', async () => {
      const retro = await service.getRetro('nope');

      expect(retro).toBeNull();
    });
  });
});
