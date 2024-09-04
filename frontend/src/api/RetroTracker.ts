import {
  SharedReducer,
  type Dispatch,
  type DispatchSpec,
} from 'shared-reducer/frontend';
import { type Retro } from '../shared/api-entities';
import { SubscriptionTracker } from './SubscriptionTracker';
import { context, type Spec } from './reducer';

export type RetroError = any;

interface RetroKey {
  retroId: string;
  retroToken: string;
}

export type RetroState =
  | {
      retro: Retro;
      error: null;
    }
  | {
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
    _apiBase: string,
    wsBase: string,
    retroId: string,
    retroToken: string,
  ) {
    this.retroStateCallbacks = new Set();

    const setState = (state: RetroState) => {
      this.latestState = state;
      this.retroStateCallbacks.forEach((fn) => fn(state));
    };

    this.reducer = SharedReducer.for<Retro>(
      `${wsBase}/retros/${retroId}`,
      (data) => setState({ retro: data, error: null }),
    )
      .withReducer(context)
      .withToken(retroToken)
      .withErrorHandler((err) => setState({ retro: null, error: err }))
      .build();
  }

  public addStateCallback(stateCallback: RetroStateCallback) {
    this.retroStateCallbacks.add(stateCallback);
    if (this.latestState) {
      stateCallback(this.latestState);
    }
  }

  public removeStateCallback(stateCallback: RetroStateCallback) {
    this.retroStateCallbacks.delete(stateCallback);
  }

  public close() {
    this.reducer.close();
  }
}

export class RetroTracker {
  private readonly subscriptionTracker: SubscriptionTracker<
    RetroKey,
    RetroWrapper
  >;

  public constructor(apiBase: string, wsBase: string) {
    this.subscriptionTracker = new SubscriptionTracker(
      ({ retroId, retroToken }): RetroWrapper =>
        new RetroWrapper(apiBase, wsBase, retroId, retroToken),
      (service) => service.close(),
    );
  }

  public subscribe(
    retroId: string,
    retroToken: string,
    dispatchCallback: (dispatch: RetroDispatch) => void,
    retroStateCallback: RetroStateCallback,
    _errorCallback: (err: RetroError) => void, // TODO
  ): RetroSubscription {
    const sub = this.subscriptionTracker.subscribe({ retroId, retroToken });
    dispatchCallback(sub.service.reducer.dispatch);
    sub.service.addStateCallback(retroStateCallback);

    return {
      unsubscribe: () => {
        sub.service.removeStateCallback(retroStateCallback);
        sub.unsubscribe().catch((e) => {
          console.warn(`Failed to unsubscribe from retro ${retroId}`, e);
        });
      },
    };
  }
}
