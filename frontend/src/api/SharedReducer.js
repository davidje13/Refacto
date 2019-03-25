import update from 'json-immutability-helper';

export default class SharedReducer {
  constructor(wsUrl, changeCallback = null, errorCallback = null) {
    this.changeCallback = changeCallback;
    this.errorCallback = errorCallback;

    this.latestServerState = null;
    this.latestLocalState = null;
    this.localChanges = [];
    this.pendingChanges = [];
    this.idCounter = 0;

    this.ws = new WebSocket(wsUrl);
    this.ws.addEventListener('message', this.handleMessage);
    this.ws.addEventListener('error', this.handleError);
  }

  internalGetUniqueId() {
    this.idCounter += 1;
    return this.idCounter;
  }

  close() {
    this.ws.close();
    this.latestServerState = null;
    this.latestLocalState = null;
    this.localChanges = [];
    this.pendingChanges = [];
  }

  internalNotify() {
    if (!this.changeCallback) {
      return;
    }
    this.changeCallback(this.getState());
  }

  internalApply(change) {
    const oldState = this.getState();

    this.latestLocalState = update(oldState, change);
    if (this.latestLocalState === oldState) {
      // nothing changed
      return false;
    }

    const event = { change, id: this.internalGetUniqueId() };
    this.localChanges.push(event);
    this.ws.send(JSON.stringify(event));
    return true;
  }

  internalApplyPendingChanges() {
    if (!this.pendingChanges.length || !this.getState()) {
      return false;
    }

    let changed = false;
    this.pendingChanges.forEach((change) => {
      if (this.internalApply(change)) {
        changed = true;
      }
    });
    this.pendingChanges.length = 0;
    return changed;
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
    this.errorCallback?.('Failed to connect');
  };

  getState() {
    if (!this.latestLocalState && this.latestServerState) {
      let state = this.latestServerState;
      this.localChanges.forEach((change) => {
        state = update(state, change);
      });
      this.latestLocalState = state;
    }
    return this.latestLocalState;
  }
}
