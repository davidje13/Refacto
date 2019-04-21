import loadHttp from '../rxjs/loadHttp';

export default class RetroListTracker {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  get(userToken) {
    return loadHttp({
      url: `${this.apiBase}/retros`,
      headers: { Authorization: `Bearer ${userToken}` },
    });
  }
}
