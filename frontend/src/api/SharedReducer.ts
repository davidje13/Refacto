import update, { Spec } from 'json-immutability-helper';

interface Event<T> {
  change: Spec<T>;
  id: number | null;
}

type SpecGenerator<T> = (state: T) => DispatchSpec<T>;
type SpecSource<T> = Spec<T> | SpecGenerator<T> | null;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SpecSourceL<T> extends Array<SpecSourceL<T> | SpecSource<T>> {}

export type DispatchSpec<T> = SpecSourceL<T> | SpecSource<T>;
export type Dispatch<T> = (spec: DispatchSpec<T>) => void;

function toSpecSourceList<T>(spec: DispatchSpec<T>): SpecSource<T>[] {
  if (!spec) {
    return [];
  }
  if (Array.isArray(spec)) {
    return spec.flatMap((c) => toSpecSourceList(c));
  }
  return [spec];
}

export default class SharedReducer<T> {
  private latestServerState?: T;

  private latestLocalState?: T;

  private currentChange?: Spec<T>;

  private localChanges: Event<T>[] = [];

  private pendingChanges: SpecSource<T>[] = [];

  private idCounter = 0;

  private ws: WebSocket;

  public constructor(
    wsUrl: string,
    token: string,
    private readonly changeCallback: ((state: T) => void) | undefined = undefined,
    private readonly errorCallback: ((error: string) => void) | undefined = undefined,
  ) {
    this.ws = new WebSocket(wsUrl);
    this.ws.addEventListener('message', this.handleMessage);
    this.ws.addEventListener('error', this.handleError);
    this.ws.addEventListener('open', () => this.ws.send(token), { once: true });
  }

  public close(): void {
    this.ws.close();
    this.latestServerState = undefined;
    this.latestLocalState = undefined;
    this.currentChange = undefined;
    this.localChanges = [];
    this.pendingChanges = [];
  }

  public dispatch: Dispatch<T> = (change) => {
    const changeList = toSpecSourceList(change);

    if (!changeList.length) {
      return;
    }

    if (!this.getState()) {
      this.pendingChanges.push(...changeList);
    } else if (this.internalApply(changeList)) {
      this.internalNotify();
    }
  };

  public getState(): T | undefined {
    if (!this.latestLocalState && this.latestServerState) {
      let state = this.latestServerState;
      state = update(
        state,
        update.combine(this.localChanges.map(({ change }) => change)),
      );
      if (this.currentChange) {
        state = update(state, this.currentChange);
      }
      this.latestLocalState = state;
    }
    return this.latestLocalState;
  }

  private internalGetUniqueId(): number {
    this.idCounter += 1;
    return this.idCounter;
  }

  private internalNotify(): void {
    if (!this.changeCallback) {
      return;
    }
    this.changeCallback(this.getState()!);
  }

  private internalSend = (): void => {
    const event = {
      change: this.currentChange!,
      id: this.internalGetUniqueId(),
    };
    this.localChanges.push(event);
    this.ws.send(JSON.stringify(event));
    this.currentChange = undefined;
  };

  private internalApplyPart(change: SpecSource<T>): boolean {
    if (!change) {
      return false;
    }

    const oldState = this.getState()!;

    if (typeof change === 'function') {
      return this.internalApply(toSpecSourceList(change(oldState)));
    }

    this.latestLocalState = update(oldState, change);
    if (this.latestLocalState === oldState) {
      // nothing changed
      return false;
    }

    if (this.currentChange === undefined) {
      this.currentChange = change;
      setImmediate(this.internalSend);
    } else {
      this.currentChange = update.combine([this.currentChange, change]);
    }
    return true;
  }

  private internalApplyCombined(changes: Spec<T>[]): boolean {
    return this.internalApplyPart(update.combine(changes));
  }

  private internalApply(changes: SpecSource<T>[]): boolean {
    let anyChange = false;
    const aggregate: Spec<T>[] = [];
    changes.forEach((change) => {
      if (change && typeof change !== 'function') {
        aggregate.push(change);
      } else {
        if (aggregate.length > 0) {
          anyChange = this.internalApplyCombined(aggregate) || anyChange;
          aggregate.length = 0;
        }
        anyChange = this.internalApplyPart(change) || anyChange;
      }
    });
    if (aggregate.length > 0) {
      anyChange = this.internalApplyCombined(aggregate) || anyChange;
    }
    return anyChange;
  }

  private internalApplyPendingChanges(): boolean {
    if (!this.pendingChanges.length || !this.getState()) {
      return false;
    }

    const anyChange = this.internalApply(this.pendingChanges);
    this.pendingChanges.length = 0;
    return anyChange;
  }

  private handleMessage = ({ data }: { data: string }): void => {
    const { change, id = null } = JSON.parse(data) as Event<T>;
    let changed = true;

    if (id !== null) {
      const index = this.localChanges.findIndex((c) => (c.id === id));
      if (index !== -1) {
        this.localChanges.splice(index, 1);
      }
      if (index === 0) {
        // removed the oldest pending change and applied it to the base
        // server state: nothing has changed
        changed = false;
      }
    }
    this.latestServerState = update(this.latestServerState || ({} as any), change);
    if (changed) {
      this.latestLocalState = undefined;
    }
    if (this.internalApplyPendingChanges() || changed) {
      this.internalNotify();
    }
  };

  private handleError = (): void => {
    // TODO TypeScript#16
    if (this.errorCallback) {
      this.errorCallback('Failed to connect');
    }
  };
}
