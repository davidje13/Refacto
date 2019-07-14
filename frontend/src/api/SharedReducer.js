import update from 'json-immutability-helper';

export default class SharedReducer {
  constructor(
    wsUrl,
    token = null,
    changeCallback = null,
    errorCallback = null,
  ) {
    this.changeCallback = changeCallback;
    this.errorCallback = errorCallback;

    this.latestServerState = null;
    this.latestLocalState = null;
    this.currentChange = null;
    this.localChanges = [];
    this.pendingChanges = [];
    this.idCounter = 0;

    this.ws = new WebSocket(wsUrl);
    this.ws.addEventListener('message', this.handleMessage);
    this.ws.addEventListener('error', this.handleError);
    this.ws.addEventListener('open', () => this.ws.send(token), { once: true });
  }

  internalGetUniqueId() {
    this.idCounter += 1;
    return this.idCounter;
  }

  close() {
    this.ws.close();
    this.latestServerState = null;
    this.latestLocalState = null;
    this.currentChange = null;
    this.localChanges = [];
    this.pendingChanges = [];
  }

  internalNotify() {
    if (!this.changeCallback) {
      return;
    }
    this.changeCallback(this.getState());
  }

  internalSend = () => {
    const event = {
      change: this.currentChange,
      id: this.internalGetUniqueId(),
    };
    this.localChanges.push(event);
    this.ws.send(JSON.stringify(event));
    this.currentChange = null;
  };

  internalApply(change) {
    const oldState = this.getState();

    this.latestLocalState = update(oldState, change);
    if (this.latestLocalState === oldState) {
      // nothing changed
      return false;
    }

    if (this.currentChange === null) {
      this.currentChange = change;
      setImmediate(this.internalSend);
    } else {
      this.currentChange = update.combine([this.currentChange, change]);
    }
    return true;
  }

  internalApplyPendingChanges() {
    if (!this.pendingChanges.length || !this.getState()) {
      return false;
    }

    const aggregate = update.combine(this.pendingChanges);
    this.pendingChanges.length = 0;
    return this.internalApply(aggregate);
  }

  dispatch = (change) => {
    if (!change) {
      return;
    }

    if (!this.getState()) {
      this.pendingChanges.push(change);
    } else if (this.internalApply(change)) {
      this.internalNotify();
    }
  };

  handleMessage = ({ data }) => {
    const { change, id = null } = JSON.parse(data);
    let changed = true;

    if (id !== null) {
      const index = this.localChanges.findIndex((c) => (c.id === id));
      if (index !== -1) {
        this.localChanges.splice(index, 1);
      }
      if (index === 0) {
        // removed the oldest pending change and applied it to the base
        // server state: nothing has changed
        changed = false;
      }
    }
    this.latestServerState = update(this.latestServerState || {}, change);
    if (changed) {
      this.latestLocalState = null;
    }
    if (this.internalApplyPendingChanges() || changed) {
      this.internalNotify();
    }
  };

  handleError = () => {
    // TODO TypeScript#16
    if (this.errorCallback) {
      this.errorCallback('Failed to connect');
    }
  };

  getState() {
    if (!this.latestLocalState && this.latestServerState) {
      let state = this.latestServerState;
      state = update(
        state,
        update.combine(this.localChanges.map(({ change }) => change)),
      );
      if (this.currentChange) {
        state = update(state, this.currentChange);
      }
      this.latestLocalState = state;
    }
    return this.latestLocalState;
  }
}
