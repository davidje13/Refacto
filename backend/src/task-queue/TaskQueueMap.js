import AsyncTaskQueue from './AsyncTaskQueue';

const factoryAsyncTaskQueue = () => new AsyncTaskQueue();

export default class TaskQueueMap {
  constructor(queueFactory = factoryAsyncTaskQueue) {
    this.queues = new Map();
    this.queueFactory = queueFactory;
  }

  push(key, task) {
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
