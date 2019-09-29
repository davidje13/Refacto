import AsyncTaskQueue from './AsyncTaskQueue';
import { TaskQueue, Task } from './TaskQueue';

export default class TaskQueueMap<T> {
  private readonly queues = new Map<string, TaskQueue<T>>();

  public constructor(
    private readonly queueFactory = (): TaskQueue<T> => new AsyncTaskQueue<T>(),
  ) {}

  public push(key: string, task: Task<T>): Promise<T> {
    let queue = this.queues.get(key);
    if (!queue) {
      queue = this.queueFactory();
      queue.on('drain', () => {
        this.queues.delete(key);
      });
      this.queues.set(key, queue);
    }
    return queue.push(task);
  }
}
