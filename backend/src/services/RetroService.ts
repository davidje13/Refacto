import update, { Spec } from 'json-immutability-helper';
import uuidv4 from 'uuid/v4';
import { DB, Collection, encryptByRecordWithMasterKey } from 'collection-storage';
import { Retro, RetroSummary } from 'refacto-entities';
import UniqueIdProvider from '../helpers/UniqueIdProvider';
import TaskQueueMap from '../task-queue/TaskQueueMap';
import TopicMap from '../queue/TopicMap';
import { extractRetro } from '../helpers/jsonParsers';

type Identifier = string | null;
type RetroSpec = Spec<Retro>;

export interface ChangeInfo {
  error?: string;
  change?: RetroSpec;
}

export interface TopicMessage {
  message: ChangeInfo;
  source: Identifier;
  meta?: any;
}

export interface RetroSubscription<MetaT> {
  getInitialData: () => Readonly<Retro>;
  send: (change: RetroSpec, meta?: MetaT) => Promise<void>;
  close: () => Promise<void>;
}

const SENSITIVE_FIELDS: (keyof Retro)[] = ['id', 'ownerId', 'slug'];

function specToDiff<T>(
  original: T,
  spec: Spec<T>,
  validator: (v: unknown) => T,
  blockedFields: string[],
): Partial<T> {
  const updated = update(original, spec);

  // (required because Spec<Retro> is not validated at request time
  // due to data structure complexity)
  const validated = validator(updated);

  const diff: Partial<T> = {};
  Object.keys(updated).forEach((k) => {
    if (!Object.prototype.hasOwnProperty.call(original, k)) {
      throw new Error(`Cannot add field ${k}`);
    }
    const key = k as keyof T & string;
    if (updated[key] !== original[key]) {
      if (blockedFields.includes(key)) {
        throw new Error(`Cannot edit field ${key}`);
      }
      diff[key] = validated[key];
    }
  });
  return diff;
}

export default class RetroService {
  private readonly retroCollection: Collection<Retro>;

  private readonly idProvider: UniqueIdProvider;

  private readonly taskQueues: TaskQueueMap<void>;

  public constructor(
    db: DB,
    encryptionKey: Buffer,
    private readonly retroChangeSubs: TopicMap<TopicMessage>,
  ) {
    const enc = encryptByRecordWithMasterKey<Retro>(
      encryptionKey.toString('base64'),
      db.getCollection('retro_key'),
      128,
    );

    this.retroCollection = enc(['items'], db.getCollection('retro', {
      slug: { unique: true },
      ownerId: {},
    }));

    this.idProvider = new UniqueIdProvider();
    this.taskQueues = new TaskQueueMap<void>();
  }

  public async getRetroIdForSlug(slug: string): Promise<string | null> {
    const retroData = await this.retroCollection.get('slug', slug, ['id']);
    if (!retroData) {
      return null;
    }
    return retroData.id;
  }

  public async createRetro(
    ownerId: string,
    slug: string,
    name: string,
    format: string,
  ): Promise<string> {
    const id = uuidv4();

    try {
      await this.retroCollection.add({
        id,
        slug,
        name,
        ownerId,
        state: {},
        format,
        options: {},
        items: [],
      });
    } catch (e) {
      if (e.message === 'duplicate' || e.code === 11000) {
        throw new Error('slug exists');
      } else {
        throw e;
      }
    }

    return id;
  }

  public async updateRetro(
    retroId: string,
    change: RetroSpec,
  ): Promise<void> {
    return this.internalQueueChange(retroId, change, null);
  }

  public getRetroListForUser(ownerId: string): Promise<RetroSummary[]> {
    return this.retroCollection
      .getAll('ownerId', ownerId, ['id', 'slug', 'name']);
  }

  public async subscribeRetro<MetaT>(
    retroId: string,
    onChange: (message: ChangeInfo, meta?: MetaT) => void,
  ): Promise<RetroSubscription<MetaT> | null> {
    let initialData = await this.retroCollection.get('id', retroId);
    if (!initialData) {
      return null;
    }

    const myId = this.idProvider.get();
    const eventHandler = ({ message, source, meta }: TopicMessage): void => {
      if (source === myId) {
        onChange(message, meta);
      } else if (message.change) {
        onChange(message, undefined);
      }
    };

    this.retroChangeSubs.add(retroId, eventHandler);

    return {
      getInitialData: (): Readonly<Retro> => {
        if (!initialData) {
          throw new Error('Already fetched initialData');
        }
        const data = initialData;
        initialData = null; // GC
        return data;
      },
      send: (
        change: RetroSpec,
        meta?: MetaT,
      ): Promise<void> => this.internalQueueChange(
        retroId,
        change,
        myId,
        meta,
      ),
      close: async (): Promise<void> => {
        await this.retroChangeSubs.remove(retroId, eventHandler);
      },
    };
  }

  private async internalApplyChange(
    retroId: string,
    change: RetroSpec,
    source: Identifier,
    meta?: any,
  ): Promise<void> {
    const retro = await this.retroCollection.get('id', retroId);
    try {
      if (!retro) {
        throw new Error('Retro deleted');
      }
      const diff = specToDiff(retro, change, extractRetro, SENSITIVE_FIELDS);
      await this.retroCollection.update('id', retroId, diff);
    } catch (e) {
      this.retroChangeSubs.broadcast(retroId, {
        message: { error: e.message },
        source,
        meta,
      });
      return;
    }

    this.retroChangeSubs.broadcast(retroId, {
      message: { change },
      source,
      meta,
    });
  }

  private async internalQueueChange(
    retroId: string,
    change: RetroSpec,
    source: Identifier,
    meta?: any,
  ): Promise<void> {
    return this.taskQueues.push(
      retroId,
      () => this.internalApplyChange(retroId, change, source, meta),
    );
  }
}
