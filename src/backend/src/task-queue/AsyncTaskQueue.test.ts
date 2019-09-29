import AsyncTaskQueue from './AsyncTaskQueue';

class ControllablePromise<T> {
  public preResolve: T | null = null;

  public preReject: Error | null = null;

  public hasStarted = false;

  public resolve: (v: T) => void = (v) => {
    this.preResolve = v;
  };

  public reject: (v: Error) => void = (v) => {
    this.preReject = v;
  };

  public makePromiseFactory(): () => Promise<T> {
    return (): Promise<T> => new Promise<T>((resolve, reject): void => {
      this.hasStarted = true;
      this.resolve = resolve;
      this.reject = reject;
      if (this.preResolve) {
        this.resolve(this.preResolve);
      }
      if (this.preReject) {
        this.reject(this.preReject);
      }
    });
  }
}

describe('AsyncTaskQueue', () => {
  it('runs asynchronous tasks and returns the results', async () => {
    const queue = new AsyncTaskQueue();

    const result = await queue.push(async () => {
      await new Promise((resolve): void => resolve());
      return 3;
    });

    expect(result).toEqual(3);
  });

  it('propagates exceptions', async () => {
    const queue = new AsyncTaskQueue();

    let capturedError = null;
    try {
      await queue.push(async () => {
        await new Promise((resolve): void => resolve());
        throw new Error('nope');
      });
    } catch (e) {
      capturedError = e;
    }

    expect(capturedError).not.toEqual(null);
    expect(capturedError.message).toEqual('nope');
  });

  it('waits for previous tasks before beginning new tasks', async () => {
    const queue = new AsyncTaskQueue();

    const task1 = new ControllablePromise();
    const task2 = new ControllablePromise();
    let result1 = null;
    let result2 = null;

    const promise1 = queue.push(task1.makePromiseFactory())
      .catch((e) => ({ err: e.message }))
      .then((result) => {
        result1 = result;
      });

    const promise2 = queue.push(task2.makePromiseFactory())
      .catch((e) => ({ err: e.message }))
      .then((result) => {
        result2 = result;
      });

    expect(task1.hasStarted).toEqual(true);
    expect(task2.hasStarted).toEqual(false);
    expect(result1).toEqual(null);
    expect(result2).toEqual(null);

    task1.resolve('A');
    await promise1;

    expect(task2.hasStarted).toEqual(true);
    expect(result1).toEqual('A');
    expect(result2).toEqual(null);

    task2.resolve('B');
    await promise2;

    expect(result2).toEqual('B');
  });

  it('continues after exceptions', async () => {
    const queue = new AsyncTaskQueue();

    const task1 = new ControllablePromise();
    const task2 = new ControllablePromise();
    let result1 = null;
    let result2 = null;

    const promise1 = queue.push(task1.makePromiseFactory())
      .catch((e) => ({ err: e.message }))
      .then((result) => {
        result1 = result;
      });

    const promise2 = queue.push(task2.makePromiseFactory())
      .catch((e) => ({ err: e.message }))
      .then((result) => {
        result2 = result;
      });

    task1.reject(new Error('nope'));
    await promise1;

    expect(task2.hasStarted).toEqual(true);
    expect(result1).toEqual({ err: 'nope' });
    expect(result2).toEqual(null);

    task2.resolve('B');
    await promise2;

    expect(result2).toEqual('B');
  });

  it('emits a "drain" event after the last item completes', async () => {
    const queue = new AsyncTaskQueue();
    let drainCalls = 0;
    queue.on('drain', () => {
      drainCalls += 1;
    });

    const task1 = new ControllablePromise();
    const task2 = new ControllablePromise();

    const promise1 = queue.push(task1.makePromiseFactory());
    const promise2 = queue.push(task2.makePromiseFactory());

    expect(drainCalls).toEqual(0);

    task1.resolve('A');
    await promise1;
    expect(drainCalls).toEqual(0);

    task2.resolve('B');
    await promise2;
    expect(drainCalls).toEqual(1);
  });
});
