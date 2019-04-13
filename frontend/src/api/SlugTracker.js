export default class SlugTracker {
  constructor(apiBase) {
    this.apiBase = apiBase;
    this.slugs = new Map();
  }

  internalGetMutableInfo(slug) {
    let slugInfo = this.slugs.get(slug);
    if (!slugInfo) {
      slugInfo = { id: null, subscriptions: new Set() };
      this.slugs.set(slug, slugInfo);
    }
    return slugInfo;
  }

  set(slug, id) {
    const slugInfo = this.internalGetMutableInfo(slug);
    if (slugInfo.id === id) {
      return;
    }
    slugInfo.id = id;
    slugInfo.subscriptions.forEach((sub) => sub(slugInfo.id));
  }

  subscribe(slug, dataCallback, errorCallback) {
    const slugInfo = this.internalGetMutableInfo(slug);
    if (!slugInfo.subscriptions.size) {
      global.fetch(`${this.apiBase}/slugs/${slug}`)
        .then((data) => {
          if (data.status >= 500) {
            throw new Error('internal error');
          }
          if (data.status === 404) {
            throw new Error('not found');
          }
          if (data.status >= 400) {
            throw new Error('unknown error');
          }
          return data.json();
        })
        .then((data) => this.set(slug, data.id))
        .catch((error) => {
          if (error && typeof error === 'object' && error.message) {
            errorCallback(String(error.message));
          } else {
            errorCallback(String(error));
          }
        });
    }

    slugInfo.subscriptions.add(dataCallback);
    if (slugInfo.id !== null) {
      dataCallback(slugInfo.id);
    }

    return {
      unsubscribe: () => {
        slugInfo.subscriptions.delete(dataCallback);
      },
    };
  }
}
