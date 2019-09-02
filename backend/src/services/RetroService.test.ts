import crypto from 'crypto';
import { MemoryDb } from 'collection-storage';
import { Spec } from 'json-immutability-helper';
import { makeRetroItem, Retro } from 'refacto-entities';
import RetroService, { TopicMessage, ChangeInfo } from './RetroService';
import TrackingTopicMap from '../queue/TrackingTopicMap';
import InMemoryTopic from '../queue/InMemoryTopic';
import Topic from '../queue/Topic';

const nop = (): void => {};

interface CapturedChange {
  message: ChangeInfo;
  meta: any;
}

class ChangeListener {
  public readonly messages: CapturedChange[] = [];

  public readonly onChange: (message: ChangeInfo, meta: any) => void;

  public constructor() {
    this.onChange = (message: ChangeInfo, meta: any): void => {
      this.messages.push({ message, meta });
    };
  }

  public messageCount(): number {
    return this.messages.length;
  }

  public latestChange(): Spec<Retro> | undefined {
    if (this.messages.length === 0) {
      return undefined;
    }
    const { message } = this.messages[this.messages.length - 1];
    return message ? message.change : undefined;
  }

  public latestError(): any | undefined {
    if (this.messages.length === 0) {
      return undefined;
    }
    const { message } = this.messages[this.messages.length - 1];
    return message ? message.error : undefined;
  }

  public latestMeta(): any {
    if (this.messages.length === 0) {
      return undefined;
    }
    return this.messages[this.messages.length - 1].meta;
  }
}

describe('RetroService', () => {
  let service: RetroService;
  let r1: string;
  let r2: string;

  beforeEach(async () => {
    const db = new MemoryDb();
    const topic = new TrackingTopicMap<TopicMessage>(
      (): Topic<TopicMessage> => new InMemoryTopic(),
    );
    service = new RetroService(db, crypto.randomBytes(32), topic);
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
      items: { $push: [makeRetroItem({ id: 'yes' })] },
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
      expect(retro.format).toEqual('other');
      expect(retro.items.length).toEqual(1);
      expect(retro.state).toEqual({ someRetroSpecificState: true });
    });

    it('returns null if the ID is not found', async () => {
      const subscription = await service.subscribeRetro('nope', nop);

      expect(subscription).toBeNull();
    });

    it('sends updates when data changes', async () => {
      const listener = new ChangeListener();
      const subscription = await service.subscribeRetro(r2, listener.onChange);

      const change = { name: { $set: 'New name' } };
      await subscription!.send(change);

      expect(listener.messageCount()).toEqual(1);
      expect(listener.latestChange()).toEqual(change);

      subscription!.close();
    });

    it('sends updates between listeners when data changes', async () => {
      const listener1 = new ChangeListener();
      const listener2 = new ChangeListener();

      const subscription1 = await service.subscribeRetro(r2, listener1.onChange);
      const subscription2 = await service.subscribeRetro(r2, listener2.onChange);

      const change = { name: { $set: 'New name' } };
      await subscription1!.send(change);

      expect(listener2.messageCount()).toEqual(1);
      expect(listener2.latestChange()).toEqual(change);

      subscription1!.close();
      subscription2!.close();
    });

    it('reflects metadata back to the sender and no other listeners', async () => {
      const listener1 = new ChangeListener();
      const listener2 = new ChangeListener();

      const subscription1 = await service.subscribeRetro(r2, listener1.onChange);
      const subscription2 = await service.subscribeRetro(r2, listener2.onChange);

      await subscription1!.send({ name: { $set: 'New name' } }, 'hello');

      expect(listener1.latestMeta()).toEqual('hello');
      expect(listener2.latestMeta()).toEqual(undefined);

      subscription1!.close();
      subscription2!.close();
    });

    it('stops sending updates after unsubscribing', async () => {
      const listener1 = new ChangeListener();
      const listener2 = new ChangeListener();

      const subscription1 = await service.subscribeRetro(r2, listener1.onChange);
      const subscription2 = await service.subscribeRetro(r2, listener2.onChange);
      subscription2!.close();

      const change = { name: { $set: 'New name' } };
      await subscription1!.send(change);

      expect(listener2.messageCount()).toEqual(0);

      subscription1!.close();
    });

    it('rejects attempts to change sensitive data', async () => {
      const listener = new ChangeListener();
      const subscription = await service.subscribeRetro(r2, listener.onChange);

      await subscription!.send({ ownerId: { $set: 'me' } });
      expect(listener.latestError()).toEqual('Cannot edit field ownerId');

      await subscription!.send({ id: { $set: '123' } });
      expect(listener.latestError()).toEqual('Cannot edit field id');

      await subscription!.send({ slug: { $set: 'wooo' } });
      expect(listener.latestError()).toEqual('Cannot edit field slug');

      subscription!.close();
    });

    it('rejects attempts to add new top-level fields', async () => {
      const listener = new ChangeListener();
      const subscription = await service.subscribeRetro(r2, listener.onChange);

      await subscription!.send({ newThing: { $set: 'woo' } } as any);
      expect(listener.latestError()).toEqual('Cannot add field newThing');

      subscription!.close();
    });

    it('rejects attempts to delete top-level fields', async () => {
      const listener = new ChangeListener();
      const subscription = await service.subscribeRetro(r2, listener.onChange);

      await subscription!.send({ $unset: ['ownerId'] });
      expect(listener.latestError()).toEqual('Cannot edit field ownerId');

      subscription!.close();
    });

    it('rejects attempts to modify retros in invalid ways', async () => {
      const listener = new ChangeListener();
      const subscription = await service.subscribeRetro(r2, listener.onChange);

      await subscription!.send({ items: { $push: [{ nope: 7 }] } } as any);
      expect(listener.latestError()).toBeTruthy();

      subscription!.close();
    });

    it('does not trigger updates for invalid edits', async () => {
      const listener1 = new ChangeListener();
      const listener2 = new ChangeListener();

      const subscription1 = await service.subscribeRetro(r2, listener1.onChange);
      const subscription2 = await service.subscribeRetro(r2, listener2.onChange);

      const change = { newThing: { $set: 'woo' } } as any;
      await subscription1!.send(change);

      expect(listener2.messageCount()).toEqual(0);

      const subscription3 = await service.subscribeRetro(r2, nop);
      const retro = subscription3!.getInitialData();
      expect((retro as any).newThing).toEqual(undefined);

      subscription1!.close();
      subscription2!.close();
      subscription3!.close();
    });
  });
});
