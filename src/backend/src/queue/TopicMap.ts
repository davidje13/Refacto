import { TopicListener } from './Topic';

export default interface TopicMap<T> {
  add(key: string, fn: TopicListener<T>): Promise<void> | void;
  remove(key: string, fn: TopicListener<T>): Promise<void> | void;
  broadcast(key: string, message: T): Promise<void> | void;
}
