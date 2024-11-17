import {
  SharedReducer,
  type Dispatch,
  type DispatchSpec,
} from 'shared-reducer/frontend';
import { type Retro } from '../shared/api-entities';
import { SubscriptionTracker } from './SubscriptionTracker';
import { context, type Spec } from './reducer';

interface RetroKey {
  retroId: string;
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
    SharedReducer<Retro, Spec<Retro>>
  >;

  public constructor(wsBase: string) {
    this.subscriptionTracker = new SubscriptionTracker(
      ({ retroId, retroToken }) => {
        const s = new SharedReducer<Retro, Spec<Retro>>(context, () => ({
          url: `${wsBase}/retros/${encodeURIComponent(retroId)}`,
          token: retroToken,
        }));
        s.addEventListener('connected', () => console.info('connected'));
        s.addEventListener('disconnected', (e) =>
          console.info('disconnected', e.detail.code, e.detail.reason),
        );
        s.addEventListener('warning', (e) =>
          console.warn('connection warning', e.detail.message),
        );
        return s;
      },
      (service) => service.close(),
    );
  }

  public subscribe(
    retroId: string,
    retroToken: string,
    retroStateCallback: (state: Retro) => void,
    connectivityCallback: (connected: boolean) => void,
  ): RetroSubscription {
    const sub = this.subscriptionTracker.subscribe({ retroId, retroToken });
    sub.service.addStateListener(retroStateCallback);
    const onConnect = () => connectivityCallback(true);
    const onDisconnect = () => connectivityCallback(false);
    sub.service.addEventListener('connected', onConnect);
    sub.service.addEventListener('disconnected', onDisconnect);

    return {
      dispatch: sub.service.dispatch,
      unsubscribe: () => {
        sub.service.removeStateListener(retroStateCallback);
        sub.service.removeEventListener('connected', onConnect);
        sub.service.removeEventListener('disconnected', onDisconnect);
        sub.unsubscribe().catch((e) => {
          console.warn(`Failed to unsubscribe from retro ${retroId}`, e);
        });
      },
    };
  }
}
