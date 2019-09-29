import EventEmitter from 'events';

export type Task<T> = () => Promise<T>;

export interface TaskQueue<T> extends EventEmitter {
  push(task: Task<T>): Promise<T>;
}

export type TaskQueueFactory<T> = () => TaskQueue<T>;
