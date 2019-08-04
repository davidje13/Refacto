import { Spec } from 'json-immutability-helper';
import { Retro } from 'refacto-entities';
import SubscriptionTracker from './SubscriptionTracker';
import SharedReducer from './SharedReducer';

interface RetroKey {
  retroId: string;
  retroToken: string;
}

export type RetroState = {
  retro: Retro['retro'];
  error: null;
} | {
  retro: null;
  error: any;
};

type RetroDispatch = (spec: Spec<Retro['retro']>) => void;
type RetroStateCallback = (state: RetroState) => void;

interface RetroSubscription {
  unsubscribe(): void;
}

class RetroWrapper {
  public readonly reducer: SharedReducer<Retro['retro']>;

  private readonly retroStateCallbacks = new Set<RetroStateCallback>();

  private latestState?: RetroState;

  public constructor(
    apiBase: string,
    wsBase: string,
    retroId: string,
    retroToken: string,
  ) {
    this.retroStateCallbacks = new Set();

    const setState = (state: RetroState): void => {
      this.latestState = state;
      this.retroStateCallbacks.forEach((fn) => fn(state));
    };

    this.reducer = new SharedReducer<Retro['retro']>(
      `${wsBase}/retros/${retroId}`,
      retroToken,
      (data): void => setState({ retro: data, error: null }),
      (err): void => setState({ retro: null, error: err }),
    );
  }

  public addStateCallback(stateCallback: RetroStateCallback): void {
    this.retroStateCallbacks.add(stateCallback);
    if (this.latestState) {
      stateCallback(this.latestState);
    }
  }

  public removeStateCallback(stateCallback: RetroStateCallback): void {
    this.retroStateCallbacks.delete(stateCallback);
  }

  public close(): void {
    this.reducer.close();
  }
}

export default class RetroTracker {
  private readonly subscriptionTracker: SubscriptionTracker<RetroKey, RetroWrapper>;

  public constructor(apiBase: string, wsBase: string) {
    this.subscriptionTracker = new SubscriptionTracker(
      ({ retroId, retroToken }): RetroWrapper => new RetroWrapper(
        apiBase,
        wsBase,
        retroId,
        retroToken,
      ),
      (service): void => service.close(),
    );
  }

  public subscribe(
    retroId: string,
    retroToken: string,
    dispatchCallback: (dispatch: RetroDispatch) => void,
    retroStateCallback: RetroStateCallback,
    // TODO
    errorCallback: (err: any) => void, /* eslint-disable-line @typescript-eslint/no-unused-vars */
  ): RetroSubscription {
    const sub = this.subscriptionTracker.subscribe({ retroId, retroToken });
    dispatchCallback(sub.service.reducer.dispatch);
    sub.service.addStateCallback(retroStateCallback);

    return {
      unsubscribe: (): void => {
        sub.service.removeStateCallback(retroStateCallback);
        sub.unsubscribe();
      },
    };
  }
}
