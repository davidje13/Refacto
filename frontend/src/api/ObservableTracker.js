export default class ObservableTracker {
  constructor() {
    this.data = new Map();
  }

  set(id, value) {
    const datum = this.data.get(id);
    if (!datum) {
      this.data.set(id, { value, listeners: new Set() });
      return;
    }
    if (datum.value === value) {
      return;
    }
    datum.value = value;
    datum.listeners.forEach((l) => l(value));
  }

  subscribe(id, callback) {
    let datum = this.data.get(id);
    if (!datum) {
      datum = { value: undefined, listeners: new Set() };
      this.data.set(id, datum);
    }
    datum.listeners.add(callback);
    if (datum.value !== undefined) {
      callback(datum.value);
    }
    return {
      unsubscribe: () => {
        datum.listeners.delete(callback);
      },
    };
  }
}
