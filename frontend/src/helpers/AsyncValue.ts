type ResolvedState<T, Err> = [T | null, Err | null];

export class AsyncValue<T, Err = never> {
  private readonly subscribers = new Set<() => void>();
  private producer: ((signal: AbortSignal) => Promise<T>) | null = null;
  private initialised = false;
  private state: ResolvedState<T, Err> = [null, null];
  private loaderAC: AbortController | null = null;

  constructor() {}

  static readonly EMPTY = new AsyncValue<never, never>();

  static withProducer<T>(producer: (signal: AbortSignal) => Promise<T>) {
    const v = new AsyncValue<T, Error>();
    v.producer = producer;
    return v;
  }

  readonly peekState = () => this.state;

  readonly subscribe = (callback: () => void) => {
    this.subscribers.add(callback);
    if (!this.initialised && !this.loaderAC) {
      this.init();
    }
    return () => {
      this.subscribers.delete(callback);
    };
  };

  async getOneState() {
    if (!this.initialised) {
      await this.waitForNext();
    }
    return this.state;
  }

  async getOneValue(): Promise<T> {
    if (!this.initialised) {
      await this.waitForNext();
    }
    if (this.state[1]) {
      throw this.state[1];
    }
    return this.state[0]!;
  }

  set(value: T) {
    if (this.loaderAC) {
      this.loaderAC.abort();
      this.loaderAC = null;
    }
    this._set([value, null]);
  }

  private async init() {
    if (!this.producer) {
      return;
    }
    const ac = new AbortController();
    this.loaderAC = ac;
    let state: ResolvedState<T, Err>;
    try {
      const value = await this.producer(ac.signal);
      state = [value, null];
    } catch (err) {
      // when a producer is set, Err is always Error
      state = [null, toError(err) as Err];
    }
    if (!ac.signal.aborted) {
      this.loaderAC = null;
      this._set(state);
    }
  }

  private _set(state: ResolvedState<T, Err>) {
    this.producer = null;
    let changed = !this.initialised;
    if (this.state[0] !== state[0] || this.state[1] !== state[1]) {
      this.state = state;
      changed = true;
    }
    if (changed) {
      this.initialised = true;
      for (const subscriber of this.subscribers) {
        try {
          subscriber();
        } catch {}
      }
    }
  }

  private waitForNext() {
    return new Promise<void>((resolve) => {
      const unsubscribe = this.subscribe(() => {
        unsubscribe();
        resolve();
      });
    });
  }
}

const toError = (e: unknown): Error =>
  e instanceof Error
    ? e
    : new Error(typeof e === 'string' ? e : JSON.stringify(e));
