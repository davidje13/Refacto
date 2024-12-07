export default class BlockingQueue<T> {
  private readonly pendingPush: T[] = [];
  private readonly pendingPop: ((v: T) => void)[] = [];

  push(o: T) {
    const waiting = this.pendingPop.shift();
    if (waiting) {
      waiting(o);
    } else {
      this.pendingPush.push(o);
    }
  }

  pop(): Promise<T> {
    if (this.pendingPush.length) {
      return Promise.resolve(this.pendingPush.shift()!);
    }
    return new Promise((resolve) => {
      this.pendingPop.push(resolve);
    });
  }
}
