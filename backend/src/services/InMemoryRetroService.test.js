import InMemoryRetroService from './InMemoryRetroService';

describe('InMemoryRetroService', () => {
  let service;

  beforeEach(() => {
    service = new InMemoryRetroService([
      {
        slug: 'my-retro',
        name: 'My Retro',
      },
      {
        slug: 'my-second-retro',
        name: 'My Second Retro',
      },
    ]);
  });

  describe('getRetros', () => {
    it('returns a list of current retros', async () => {
      const retros = await service.getRetros();

      expect(retros.length).toEqual(2);
      expect(retros[0].slug).toEqual('my-retro');
      expect(retros[0].name).toEqual('My Retro');
    });
  });

  describe('getRetro', () => {
    it('returns the requested retro by slug', async () => {
      const retro = await service.getRetro('my-second-retro');

      expect(retro).not.toBeNull();
      expect(retro.slug).toEqual('my-second-retro');
      expect(retro.name).toEqual('My Second Retro');
    });

    it('returns null if the slug is not found', async () => {
      const retro = await service.getRetro('nope');

      expect(retro).toBeNull();
    });
  });
});
