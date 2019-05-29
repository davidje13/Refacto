import { of as rxjsOf, throwError } from 'rxjs';
import ObservableTracker from '../../rxjs/ObservableTracker';
import SingleObservableTracker from '../../rxjs/SingleObservableTracker';

class FakeRetroTracker {
  dispatch = () => {};

  data = new Map();

  subscribed = 0;

  expectedRetroToken = null;

  setExpectedToken(retroToken) {
    this.expectedRetroToken = retroToken;
  }

  setServerData(retroId, serverData) {
    this.data.set(retroId, serverData);
  }

  subscribe(retroId, retroToken, dispatchCallback, retroStateCallback) {
    if (this.expectedRetroToken && this.expectedRetroToken !== retroToken) {
      throw new Error(`Incorrect retro token: ${retroToken}`);
    }

    this.subscribed += 1;

    const serverData = this.data.get(retroId);
    if (!serverData) {
      return throwError('not found');
    }

    dispatchCallback(this.dispatch);
    retroStateCallback(Object.assign({
      retro: null,
      error: null,
    }, serverData));

    return {
      unsubscribe: () => {
        this.subscribed -= 1;
      },
    };
  }
}

class FakeArchiveTracker {
  data = new Map();

  expectedRetroToken = null;

  setExpectedToken(retroToken) {
    this.expectedRetroToken = retroToken;
  }

  setServerData(retroId, archiveId, archive) {
    if (!this.data.has(retroId)) {
      this.data.set(retroId, new Map());
    }
    this.data.get(retroId).set(archiveId, archive);
  }

  get(retroId, archiveId, retroToken) {
    if (this.expectedRetroToken && this.expectedRetroToken !== retroToken) {
      return throwError(`Incorrect retro token: ${retroToken}`);
    }

    const serverData = this.data.get(retroId);
    if (!serverData) {
      return throwError('not found');
    }
    const archive = serverData.get(archiveId);
    if (!archive) {
      return throwError('not found');
    }
    return rxjsOf(archive);
  }

  getList(retroId, retroToken) {
    if (this.expectedRetroToken && this.expectedRetroToken !== retroToken) {
      return throwError(`Incorrect retro token: ${retroToken}`);
    }

    const archives = [];
    const serverData = this.data.get(retroId);
    if (serverData) {
      serverData.forEach((archive, archiveId) => {
        archives.push({
          id: archiveId,
          created: archive.created,
        });
      });
    }
    return rxjsOf({ archives });
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
export const archiveTracker = new FakeArchiveTracker();
export const retroTokenService = new FakeRetroTokenService();
export const retroService = new FakeRetroService();
export const userTokenService = new FakeUserTokenService();

export const retroTokenTracker = new ObservableTracker();
export const userTokenTracker = new SingleObservableTracker();
