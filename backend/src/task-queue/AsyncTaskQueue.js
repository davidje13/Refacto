import EventEmitter from 'events';

export default class AsyncTaskQueue extends EventEmitter {
  constructor() {
    super();

    this.queue = [];
    this.running = false;
  }

  async internalConsumeQueue() {
    this.running = true;
    while (this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();

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
        resolve(result);
      }
    }
    this.running = false;
    this.emit('drain');
  }

  push(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      if (!this.running) {
        this.internalConsumeQueue();
      }
    });
  }
}
