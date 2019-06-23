export type TopicListener<T> = (message: T) => void;

export interface Topic<T> {
  add(fn: TopicListener<T>): Promise<void>|void;
  remove(fn: TopicListener<T>): Promise<boolean>|boolean;
  broadcast(message: T): Promise<void>|void;
}

export type TopicFactory<T> = (key: string) => Topic<T>;
