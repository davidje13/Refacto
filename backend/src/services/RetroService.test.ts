import { randomBytes } from 'node:crypto';
import { MemoryDb } from '../import-wrappers/collection-storage-wrap';
import type { Spec } from 'json-immutability-helper';
import type { ChangeInfo, Subscription } from 'shared-reducer/backend';
import { makeRetroItem, type Retro } from '../shared/api-entities';
import { RetroService } from './RetroService';

interface CapturedChange {
  message: ChangeInfo<Spec<Retro>>;
  meta: unknown;
}

class ChangeListener {
  public readonly messages: CapturedChange[] = [];

  public readonly onChange: (
    message: ChangeInfo<Spec<Retro>>,
    meta: unknown,
  ) => void;

  public constructor() {
    this.onChange = (message: ChangeInfo<Spec<Retro>>, meta: unknown) => {
      this.messages.push({ message, meta });
    };
  }

  public messageCount(): number {
    return this.messages.length;
  }

  public latestChange(): Spec<Retro> | undefined {
    return this.latestMessage()?.message?.change;
  }

  public latestError(): string | undefined {
    return this.latestMessage()?.message?.error;
  }

  public latestMeta(): unknown {
    return this.latestMessage()?.meta;
  }

  private latestMessage(): CapturedChange | undefined {
    return this.messages[this.messages.length - 1];
  }
}

describe('RetroService', () => {
  let service: RetroService;
  let r1: string;
  let r2: string;

  beforeEach(async () => {
    const db = new MemoryDb();
    service = new RetroService(db, randomBytes(32));
    r1 = await service.createRetro('me', 'my-retro', 'My Retro', 'something');
    r2 = await service.createRetro(
      'nobody',
      'my-second-retro',
      'My Second Retro',
      'other',
    );
    await service.retroBroadcaster.update(r2, {
      state: ['=', { someRetroSpecificState: true }],
      items: ['push', makeRetroItem({ id: 'yes' })],
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

  describe('isRetroOwnedByUser', () => {
    it('returns true for retros owned by the user', async () => {
      const owned = await service.isRetroOwnedByUser(r1, 'me');

      expect(owned).toEqual(true);
    });

    it('returns false for retros not owned by the user', async () => {
      const owned = await service.isRetroOwnedByUser(r2, 'me');

      expect(owned).toEqual(false);
    });

    it('returns false for retros which do not exist', async () => {
      const owned = await service.isRetroOwnedByUser('nope', 'me');

      expect(owned).toEqual(false);
    });
  });

  describe('retroBroadcaster', () => {
    let subscription: Subscription<Retro, Spec<Retro>, void>;

    beforeEach(async () => {
      const sub = await service.retroBroadcaster.subscribe(
        r2,
        service.getPermissions(true),
      );
      if (!sub) {
        throw new Error('Failed to subscribe to retro');
      }
      subscription = sub;
    });

    afterEach(() => subscription?.close());

    it('connects to the backing retro data', async () => {
      const retro = subscription.getInitialData();

      expect(retro).not(toBeNull());
      expect(retro.name).toEqual('My Second Retro');
    });

    it('returns full details', async () => {
      const retro = subscription.getInitialData();

      expect(retro).not(toBeNull());
      expect(retro.format).toEqual('other');
      expect(retro.items.length).toEqual(1);
      expect(retro.state).toEqual({ someRetroSpecificState: true });
    });

    it('returns null if the ID is not found', async () => {
      const failedSubscription = await service.retroBroadcaster.subscribe(
        'nope',
        service.getPermissions(true),
      );

      expect(failedSubscription).toBeNull();
    });

    it('rejects attempts to change sensitive data', async () => {
      const listener = new ChangeListener();
      subscription.listen(listener.onChange);
      await subscription.send({ ownerId: ['=', 'me'] });
      expect(listener.latestError()).toEqual('Cannot edit field ownerId');

      await subscription.send({ id: ['=', '123'] });
      expect(listener.latestError()).toEqual('Cannot edit field id');
      expect(listener.messageCount()).toEqual(2);
    });

    it('allows changing slug to valid forms', async () => {
      const listener = new ChangeListener();
      subscription.listen(listener.onChange);
      await subscription.send({ slug: ['=', 'wooo'] });
      expect(listener.latestError()).toEqual(undefined);
    });

    it('does not allow conflicting slugs', async () => {
      const listener = new ChangeListener();
      subscription.listen(listener.onChange);
      await subscription.send({ slug: ['=', 'my-retro'] });
      expect(listener.latestError()).toEqual('URL is already taken');
      expect(listener.messageCount()).toEqual(1);
    });

    it('rejects changing slug to invalid values', async () => {
      const listener = new ChangeListener();
      subscription.listen(listener.onChange);
      await subscription.send({ slug: ['=', 'NOPE'] });
      expect(listener.latestError()).toEqual('Invalid URL');
      expect(listener.messageCount()).toEqual(1);
    });

    it('rejects attempts to add new top-level fields', async () => {
      const listener = new ChangeListener();
      subscription.listen(listener.onChange);
      await subscription.send({ newThing: ['=', 'woo'] } as any);
      expect(listener.latestError()).toEqual('Unexpected property newThing');
      expect(listener.messageCount()).toEqual(1);
    });

    it('rejects attempts to delete top-level fields', async () => {
      const listener = new ChangeListener();
      subscription.listen(listener.onChange);
      await subscription.send({ ownerId: ['unset'] as any });
      expect(listener.latestError()).toBeTruthy();
      expect(listener.messageCount()).toEqual(1);
    });

    it('rejects attempts to modify retros in invalid ways', async () => {
      const listener = new ChangeListener();
      subscription.listen(listener.onChange);
      await subscription.send({ items: ['push', { nope: 7 } as any] });
      expect(listener.latestError()).toBeTruthy();
      expect(listener.messageCount()).toEqual(1);
    });

    it('rejects all writes in readonly mode', async () => {
      const readSubscription = await service.retroBroadcaster.subscribe(
        r2,
        service.getPermissions(false),
      );
      const listener = new ChangeListener();
      readSubscription?.listen(listener.onChange);

      await readSubscription?.send({ slug: ['=', 'wooo'] });
      expect(listener.latestError()).toEqual('Cannot modify data');

      await readSubscription?.close();
    });
  });
});
