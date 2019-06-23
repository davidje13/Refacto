import EventEmitter from 'events';
import { Task, TaskQueue } from './TaskQueue';

interface QueueItem<T> {
  task: Task<T>;
  resolve: (v: T) => void;
  reject: (e: Error) => void;
}

export default class AsyncTaskQueu<T> extends EventEmitter implements TaskQueue<T> {
  private queue: QueueItem<T>[] = [];

  private running = false;

  public push(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject): void => {
      this.queue.push({ task, resolve, reject });
      if (!this.running) {
        this.internalConsumeQueue();
      }
    });
  }

  private async internalConsumeQueue(): Promise<void> {
    this.running = true;
    while (this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift()!;

      let result = null;
      let success = false;
      try {
        /* eslint-disable-next-line no-await-in-loop */ // intentionally serial
        result = await task();
        success = true;
      } catch (e) {
        reject(e);
      }
      if (success) {
        resolve(result!);
      }
    }
    this.running = false;
    this.emit('drain');
  }
}
