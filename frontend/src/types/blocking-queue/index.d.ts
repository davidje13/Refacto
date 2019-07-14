declare module 'blocking-queue' {
  export default class BlockingQueue<T> {
    public push(value: T): void;

    public pop(): Promise<T>;
  }
}
