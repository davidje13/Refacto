export default class TopicMap {
  constructor(topicFactory) {
    this.data = new Map();
    this.topicFactory = topicFactory;
  }

  async add(key, fn) {
    let d = this.data.get(key);
    if (!d) {
      d = this.topicFactory(key);
      this.data.set(key, d);
    }
    await d.add(fn);
  }

  async remove(key, fn) {
    const d = this.data.get(key);
    if (d) {
      const anyRemaining = await d.remove(fn);
      if (!anyRemaining) {
        this.data.delete(key);
      }
    }
  }

  async broadcast(key, message) {
    const d = this.data.get(key);
    if (d) {
      await d.broadcast(message);
    }
  }
}
