import RetroArchiveTracker from './RetroArchiveTracker';
import SubscriptionTracker from './SubscriptionTracker';
import SharedReducer from './SharedReducer';

class Retro {
  constructor(apiBase, wsBase, retroId) {
    this.retroStateCallbacks = new Set();
    this.latestState = null;

    const archiveTracker = new RetroArchiveTracker(apiBase, retroId);

    const setState = (state) => {
      this.latestState = state;
      this.retroStateCallbacks.forEach((fn) => fn(state));
    };

    this.reducer = new SharedReducer(
      `${wsBase}/retros/${retroId}`,
      (data) => setState({ retro: data, error: null, archiveTracker }),
      (err) => setState({ retro: null, error: err, archiveTracker }),
    );
  }

  addStateCallback(stateCallback) {
    this.retroStateCallbacks.add(stateCallback);
    stateCallback(this.latestState);
  }

  removeStateCallback(stateCallback) {
    this.retroStateCallbacks.delete(stateCallback);
  }

  close() {
    this.reducer.close();
  }
}

export default class RetroTracker {
  constructor(apiBase, wsBase) {
    this.subscriptionTracker = new SubscriptionTracker(
      (retroId) => new Retro(apiBase, wsBase, retroId),
      (service) => service.close(),
    );
  }

  subscribe(retroId, dispatchCallback, retroStateCallback) {
    const sub = this.subscriptionTracker.subscribe(retroId);
    dispatchCallback(sub.service.reducer.dispatch);
    sub.service.addStateCallback(retroStateCallback);

    return {
      unsubscribe: () => {
        sub.service.removeStateCallback(retroStateCallback);
        sub.unsubscribe();
      },
    };
  }
}
