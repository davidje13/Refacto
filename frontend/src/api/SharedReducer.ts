import update, { Spec } from 'json-immutability-helper';

interface Event<T> {
  change: Spec<T>;
  id: number | null;
}

export default class SharedReducer<T> {
  private latestServerState?: T;

  private latestLocalState?: T;

  private currentChange?: Spec<T>;

  private localChanges: Event<T>[] = [];

  private pendingChanges: Spec<T>[] = [];

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

  public dispatch = (change: Spec<T>): void => {
    if (!change) {
      return;
    }

    if (!this.getState()) {
      this.pendingChanges.push(change);
    } else if (this.internalApply(change)) {
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

  private internalApply(change: Spec<T>): boolean {
    const oldState = this.getState()!;

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

  private internalApplyPendingChanges(): boolean {
    if (!this.pendingChanges.length || !this.getState()) {
      return false;
    }

    const aggregate = update.combine(this.pendingChanges);
    this.pendingChanges.length = 0;
    return this.internalApply(aggregate);
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
