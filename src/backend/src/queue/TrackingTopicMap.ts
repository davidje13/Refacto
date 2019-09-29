import TopicMap from './TopicMap';
import Topic, { TopicListener } from './Topic';

export default class TrackingTopicMap<T> implements TopicMap<T> {
  private data = new Map<string, Topic<T>>();

  public constructor(
    private readonly topicFactory: (key: string) => Topic<T>,
  ) {}

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
