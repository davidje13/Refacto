import {
  SharedReducer,
  type Dispatch,
  type DispatchSpec,
  type DisconnectDetail,
} from 'shared-reducer/frontend';
import type { Retro } from '../shared/api-entities';
import { SubscriptionTracker } from './SubscriptionTracker';
import { context, type Spec } from './reducer';

interface RetroKey {
  retroId: string;
}

interface RetroAuth {
  retroToken: string;
}

export type RetroDispatchSpec = DispatchSpec<Retro, Spec<Retro>>;
export type RetroDispatch = Dispatch<Retro, Spec<Retro>>;

export interface RetroSubscription {
  dispatch: RetroDispatch;
  unsubscribe(): void;
}

export class RetroTracker {
  private readonly subscriptionTracker: SubscriptionTracker<
    RetroKey,
    RetroAuth,
    SharedReducer<Retro, Spec<Retro>>
  >;

  public constructor(
    wsBase: string,
    private readonly diagnostics: Diagnostics,
  ) {
    this.subscriptionTracker = new SubscriptionTracker(
      ({ retroId }, { retroToken }) => {
        const s = new SharedReducer<Retro, Spec<Retro>>(context, {
          url: `${wsBase}/retros/${encodeURIComponent(retroId)}`,
          token: retroToken,
        });
        s.addEventListener('connected', () => diagnostics.info('connected'));
        s.addEventListener('disconnected', (e) =>
          diagnostics.info(
            `disconnected ${e.detail.code} (${e.detail.reason})`,
          ),
        );
        s.addEventListener('warning', (e) =>
          diagnostics.warn('connection warning', e.detail.message),
        );
        return s;
      },
      (service) => service.close(),
      (service, { retroId }, { retroToken }) =>
        service.reconnect({
          url: `${wsBase}/retros/${encodeURIComponent(retroId)}`,
          token: retroToken,
        }),
    );
  }

  public subscribe(
    retroId: string,
    retroToken: string,
    retroStateCallback: (state: Retro) => void,
    connectivityCallback: (connected: boolean) => void,
    reauthenticateCallback: () => void,
  ): RetroSubscription {
    const sub = this.subscriptionTracker.subscribe({ retroId }, { retroToken });
    sub.service.addStateListener(retroStateCallback);
    const onConnect = () => connectivityCallback(true);
    const onDisconnect = () => connectivityCallback(false);
    const onRejected = (e: CustomEvent<DisconnectDetail>) => {
      const code = e.detail.code;
      if (code === 4401 || code === 4403) {
        e.preventDefault();
        reauthenticateCallback();
      }
    };
    sub.service.addEventListener('connected', onConnect);
    sub.service.addEventListener('disconnected', onDisconnect);
    sub.service.addEventListener('rejected', onRejected);

    return {
      dispatch: sub.service.dispatch,
      unsubscribe: () => {
        sub.service.removeStateListener(retroStateCallback);
        sub.service.removeEventListener('connected', onConnect);
        sub.service.removeEventListener('disconnected', onDisconnect);
        sub.service.removeEventListener('rejected', onRejected);
        sub.unsubscribe().catch((e) => {
          this.diagnostics.error('Failed to unsubscribe from retro', e);
        });
      },
    };
  }
}

interface Diagnostics {
  info(message: string): void;
  warn(message: string, err: unknown): void;
  error(message: string, err: unknown): void;
}
