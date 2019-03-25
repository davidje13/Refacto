export default class RetroListTracker {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  load(dataCallback) {
    global.fetch(`${this.apiBase}/retros`)
      .then((data) => data.json())
      .then(({ retros }) => ({ retros, error: null }))
      .catch((error) => ({ retros: null, error }))
      .then(dataCallback);
  }
}
