import { BehaviorSubject } from 'rxjs';
import ObservableTracker from '../../rxjs/ObservableTracker';
import SingleObservableTracker from '../../rxjs/SingleObservableTracker';

class FakeRetroTracker {
  dispatch = () => {};

  data = new Map();

  subscribed = 0;

  setServerData(retroId, retro, archives = {}) {
    this.data.set(retroId, { retro, archives });
  }

  subscribe(retroId, retroToken, dispatchCallback, retroStateCallback) {
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

      getList: () => {
        const archives = [];
        Object.keys(state.archives).forEach((archiveId) => {
          const archive = state.archives[archiveId];
          archives.push({
            id: archiveId,
            created: archive.created,
          });
        });
        return new BehaviorSubject({ archives });
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

class FakeUserTokenService {
  userToken = null;

  capturedService = null;

  capturedExternalToken = null;

  setServerData(userToken) {
    this.userToken = userToken;
  }

  async login(service, externalToken) {
    this.capturedService = service;
    this.capturedExternalToken = externalToken;

    if (!this.userToken) {
      throw new Error('some error');
    }
    return this.userToken;
  }
}

class FakeRetroTokenService {
  data = new Map();

  capturedPassword = null;

  setServerData(retroId, retroToken) {
    this.data.set(retroId, retroToken);
  }

  async submitPassword(retroId, password) {
    this.capturedPassword = password;
    const retroToken = this.data.get(retroId);
    if (!retroToken) {
      throw new Error('some error');
    }
    return retroToken;
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

export const configService = new SingleObservableTracker();
export const retroListTracker = new ObservableTracker();
export const slugTracker = new ObservableTracker();
export const retroTracker = new FakeRetroTracker();
export const retroTokenService = new FakeRetroTokenService();
export const retroService = new FakeRetroService();
export const userTokenService = new FakeUserTokenService();

export const retroTokenTracker = new ObservableTracker();
export const userTokenTracker = new SingleObservableTracker();
