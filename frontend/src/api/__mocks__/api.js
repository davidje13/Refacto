class FakeRetroListTracker {
  data = null;

  setServerData(data) {
    this.data = data;
  }

  load(dataCallback) {
    if (!this.data) {
      throw new Error('Unexpected request for retro list');
    }
    dataCallback(this.data);
  }
}

class FakeSlugTracker {
  data = new Map();

  setServerData(slug, data) {
    this.data.set(slug, data);
  }

  load(slug, dataCallback) {
    const info = this.data.get(slug);
    if (!info) {
      throw new Error(`Unexpected request for slug ${slug}`);
    }
    dataCallback(info);
  }
}

class FakeRetroTracker {
  dispatch = () => {};

  data = new Map();

  subscribed = 0;

  setServerData(retroId, retro, archives = {}) {
    this.data.set(retroId, { retro, archives });
  }

  subscribe(retroId, dispatchCallback, retroStateCallback) {
    this.subscribed += 1;

    const state = this.data.get(retroId);
    if (!state) {
      throw new Error(`Unexpected request for retro ${retroId}`);
    }

    const archiveTracker = {
      load: (archiveId, archiveStateCallback) => {
        const archive = state.archives[archiveId];
        if (!archive) {
          throw new Error(`Unexpected request for archive ${archiveId}`);
        }
        archiveStateCallback(Object.assign({
          archive: null,
          error: null,
        }, archive));
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

export const retroListTracker = new FakeRetroListTracker();
export const slugTracker = new FakeSlugTracker();
export const retroTracker = new FakeRetroTracker();
