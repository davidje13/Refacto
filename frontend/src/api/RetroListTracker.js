import loadHttp from '../rxjs/loadHttp';

export default class RetroListTracker {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  get() {
    return loadHttp(`${this.apiBase}/retros`);
  }
}
