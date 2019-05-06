import { MemoryDb } from 'collection-storage';
import RetroService from './RetroService';

/* eslint-disable class-methods-use-this */
class StubTopicMap {
  add() {}

  remove() {}

  broadcast() {}
}
/* eslint-enable class-methods-use-this */

describe('RetroService', () => {
  let service;
  let r1;
  let r2;

  beforeEach(async () => {
    const db = new MemoryDb();
    const topic = new StubTopicMap();
    service = new RetroService(db, topic);
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
    );
    await service.internalDistribute(r2, {
      state: { $set: { someRetroSpecificState: true } },
      data: { items: { $push: [{ anItem: 'yes' }] } },
    });
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

    it('returns null if the ID is not found', async () => {
      const subscription = await service.subscribeRetro('nope', () => {});

      expect(subscription).toBeNull();
    });
  });
});
