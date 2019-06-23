import { TopicListener, Topic, TopicFactory } from './Topic';

export default class TopicMap<T> {
  private data: Map<string, Topic<T>>;

  public constructor(private readonly topicFactory: TopicFactory<T>) {
    this.data = new Map();
  }

  public async add(key: string, fn: TopicListener<T>): Promise<void> {
    let d = this.data.get(key);
    if (!d) {
      d = this.topicFactory(key);
      this.data.set(key, d);
    }
    await d.add(fn);
  }

  public async remove(key: string, fn: TopicListener<T>): Promise<void> {
    const d = this.data.get(key);
    if (d) {
      const anyRemaining = await d.remove(fn);
      if (!anyRemaining) {
        this.data.delete(key);
      }
    }
  }

  public async broadcast(key: string, message: T): Promise<void> {
    const d = this.data.get(key);
    if (d) {
      await d.broadcast(message);
    }
  }
}
