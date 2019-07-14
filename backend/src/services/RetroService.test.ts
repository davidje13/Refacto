import { MemoryDb } from 'collection-storage';
import RetroService, { TopicMessage } from './RetroService';
import { makeRetroItem } from '../data/RetroItem';
import TopicMap from '../queue/TopicMap';

/* eslint-disable class-methods-use-this */
class StubTopicMap<T> implements TopicMap<T> {
  public add(): void {}

  public remove(): void {}

  public broadcast(): void {}
}
/* eslint-enable class-methods-use-this */

const nop = (): void => {};

describe('RetroService', () => {
  let service: RetroService;
  let r1: string;
  let r2: string;

  beforeEach(async () => {
    const db = new MemoryDb();
    const topic = new StubTopicMap<TopicMessage>();
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
    await service.updateRetro(r2, {
      state: { $set: { someRetroSpecificState: true } },
      data: { items: { $push: [makeRetroItem('yes')] } },
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
      const subscription = await service.subscribeRetro(r2, nop);
      const retro = subscription!.getInitialData();
      subscription!.close();

      expect(retro).not.toBeNull();
      expect(retro.name).toEqual('My Second Retro');
    });

    it('returns full details', async () => {
      const subscription = await service.subscribeRetro(r2, nop);
      const retro = subscription!.getInitialData();
      subscription!.close();

      expect(retro).not.toBeNull();
      expect(retro.data.format).toEqual('other');
      expect(retro.data.items.length).toEqual(1);
      expect(retro.state).toEqual({ someRetroSpecificState: true });
    });

    it('returns null if the ID is not found', async () => {
      const subscription = await service.subscribeRetro('nope', nop);

      expect(subscription).toBeNull();
    });
  });
});
