import update, { Spec } from 'json-immutability-helper';
import uuidv4 from 'uuid/v4';
import { DB, Collection } from 'collection-storage';
import { Retro, RetroSummary } from 'refacto-entities';
import UniqueIdProvider from '../helpers/UniqueIdProvider';
import TaskQueueMap from '../task-queue/TaskQueueMap';
import TopicMap from '../queue/TopicMap';

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

function checkSensitiveEdits(retro: Retro, newRetro: Retro): void {
  Object.keys(newRetro).forEach((k) => {
    if (!Object.prototype.hasOwnProperty.call(retro, k)) {
      throw new Error(`Cannot add field ${k}`);
    }
    const key = k as keyof Retro;
    if (SENSITIVE_FIELDS.includes(key) && retro[key] !== newRetro[key]) {
      throw new Error(`Cannot edit field ${key}`);
    }
  });
}

export default class RetroService {
  private readonly retroCollection: Collection<Retro>;

  private readonly idProvider: UniqueIdProvider;

  private readonly taskQueues: TaskQueueMap<void>;

  public constructor(
    db: DB,
    private readonly retroChangeSubs: TopicMap<TopicMessage>,
  ) {
    this.retroCollection = db.getCollection<Retro>('retro', {
      slug: { unique: true },
      ownerId: {},
    });
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
      const newRetro = update(retro, change);
      checkSensitiveEdits(retro, newRetro);
      await this.retroCollection.update('id', retroId, newRetro);
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
