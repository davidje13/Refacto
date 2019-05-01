export default class InMemoryTopic {
  constructor() {
    this.subscribers = new Set();
  }

  add(fn) {
    this.subscribers.add(fn);
  }

  remove(fn) {
    this.subscribers.delete(fn);
    return this.subscribers.length > 0;
  }

  broadcast(message) {
    this.subscribers.forEach((sub) => sub(message));
  }
}
