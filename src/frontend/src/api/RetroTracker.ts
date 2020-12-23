import listCommands from 'json-immutability-helper/commands/list';
import { context, Spec } from 'json-immutability-helper';
import type { Retro } from 'refacto-entities';
import SharedReducer, { Dispatch, DispatchSpec } from 'shared-reducer-frontend';
import SubscriptionTracker from './SubscriptionTracker';

export type RetroError = any;

interface RetroKey {
  retroId: string;
  retroToken: string;
}

export type RetroState = {
  retro: Retro;
  error: null;
} | {
  retro: null;
  error: RetroError;
};

export type RetroDispatchSpec = DispatchSpec<Retro, Spec<Retro>>;
export type RetroDispatch = Dispatch<Retro, Spec<Retro>>;
type RetroStateCallback = (state: RetroState) => void;

interface RetroSubscription {
  unsubscribe(): void;
}

class RetroWrapper {
  public readonly reducer: SharedReducer<Retro, Spec<Retro>>;

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

    this.reducer = SharedReducer
      .for<Retro>(`${wsBase}/retros/${retroId}`, (data): void => setState({ retro: data, error: null }))
      .withReducer(context.with(listCommands))
      .withToken(retroToken)
      .withErrorHandler((err): void => setState({ retro: null, error: err }))
      .build();
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
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */ // TODO
    errorCallback: (err: RetroError) => void,
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
