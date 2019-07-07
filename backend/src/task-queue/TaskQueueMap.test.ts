import EventEmitter from 'events';
import TaskQueueMap from './TaskQueueMap';
import { Task, TaskQueue } from './TaskQueue';

class FakeQueue<T> extends EventEmitter implements TaskQueue<T> {
  public taskCount = 0;

  public push(task: Task<T>): Promise<T> {
    this.taskCount += 1;
    return task();
  }
}

describe('TaskQueueMap', () => {
  let returnedQueues: TaskQueue<string>[];
  let map;

  beforeEach(() => {
    returnedQueues = [];
    const queueFactory = (): TaskQueue<string> => {
      const queue = new FakeQueue<string>();
      returnedQueues.push(queue);
      return queue;
    };
    map = new TaskQueueMap(queueFactory);
  });

  it('propagates results from queued tasks', () => {
    const result = map.push('a', () => 'A');

    expect(result).toEqual('A');
  });

  it('propagates errors from queued tasks', () => {
    let capturedError = null;
    try {
      map.push('a', () => {
        throw new Error('nope');
      });
    } catch (e) {
      capturedError = e;
    }

    expect(capturedError).not.toEqual(null);
    expect(capturedError.message).toEqual('nope');
  });

  it('maintains separate queues for each key', () => {
    map.push('a', () => 'A');
    expect(returnedQueues.length).toEqual(1);

    map.push('b', () => 'B');
    expect(returnedQueues.length).toEqual(2);

    map.push('b', () => 'C');
    expect(returnedQueues.length).toEqual(2);
    expect((returnedQueues[1] as FakeQueue<string>).taskCount).toEqual(2);
  });

  it('removes queues after "drain" is emitted', () => {
    map.push('a', () => 'A');
    expect(returnedQueues.length).toEqual(1);

    map.push('a', () => 'B');
    expect(returnedQueues.length).toEqual(1);
    expect((returnedQueues[0] as FakeQueue<string>).taskCount).toEqual(2);

    returnedQueues[0].emit('drain');

    map.push('a', () => 'C');
    expect(returnedQueues.length).toEqual(2);
    expect((returnedQueues[1] as FakeQueue<string>).taskCount).toEqual(1);
  });
});
