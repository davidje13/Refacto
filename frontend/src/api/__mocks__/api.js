import { ReplaySubject, BehaviorSubject } from 'rxjs';
import ObservableTracker from '../../rxjs/ObservableTracker';

class FakeRetroListTracker {
  data = new ReplaySubject(1);

  get() {
    return this.data;
  }

  set(value) {
    this.data.next(value);
  }
}

class FakeRetroTracker {
  dispatch = () => {};

  data = new Map();

  subscribed = 0;

  setServerData(retroId, retro, archives = {}) {
    this.data.set(retroId, { retro, archives });
  }

  subscribe(retroId, token, dispatchCallback, retroStateCallback) {
    this.subscribed += 1;

    const state = this.data.get(retroId);
    if (!state) {
      throw new Error(`Unexpected request for retro ${retroId}`);
    }

    const archiveTracker = {
      get: (archiveId) => {
        const archive = state.archives[archiveId];
        if (!archive) {
          throw new Error(`Unexpected request for archive ${archiveId}`);
        }
        return new BehaviorSubject(archive);
      },
    };

    dispatchCallback(this.dispatch);
    retroStateCallback(Object.assign({
      retro: null,
      error: null,
      archiveTracker,
    }, state.retro));

    return {
      unsubscribe: () => {
        this.subscribed -= 1;
      },
    };
  }
}

class FakeRetroTokenService {
  data = new Map();

  capturedPassword = null;

  setServerData(retroId, token) {
    this.data.set(retroId, token);
  }

  async submitPassword(retroId, password) {
    this.capturedPassword = password;
    const token = this.data.get(retroId);
    if (!token) {
      throw new Error('some error');
    }
    return token;
  }
}

class FakeRetroService {
  id = null;

  capturedName = null;

  capturedSlug = null;

  capturedPassword = null;

  setServerData(retroId) {
    this.id = retroId;
  }

  async create({ name, slug, password }) {
    this.capturedName = name;
    this.capturedSlug = slug;
    this.capturedPassword = password;
    return this.id;
  }
}

export const retroListTracker = new FakeRetroListTracker();
export const slugTracker = new ObservableTracker();
export const retroTracker = new FakeRetroTracker();
export const retroTokenTracker = new ObservableTracker();
export const retroTokenService = new FakeRetroTokenService();
export const retroService = new FakeRetroService();
