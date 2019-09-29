declare module 'blocking-queue' {
  class BlockingQueue<T> {
    public push(value: T): void;

    public pop(): Promise<T>;

    public size(): number;
  }

  namespace BlockingQueue {
    export class QueueConsumer<T> {
      public constructor(queue: BlockingQueue<T>);

      public start(
        consumer: (value: T) => (Promise<void> | void),
        concurrency?: number,
      ): void;

      public end(): Promise<void>;
    }
  }

  export default BlockingQueue;
}
