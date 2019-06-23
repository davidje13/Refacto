import { TopicListener, Topic } from './Topic';

export default class InMemoryTopic<T> implements Topic<T> {
  private subscribers: Set<TopicListener<T>>;

  public constructor() {
    this.subscribers = new Set();
  }

  public add(fn: TopicListener<T>): void {
    this.subscribers.add(fn);
  }

  public remove(fn: TopicListener<T>): boolean {
    this.subscribers.delete(fn);
    return this.subscribers.size > 0;
  }

  public broadcast(message: T): void {
    this.subscribers.forEach((sub): void => sub(message));
  }
}
