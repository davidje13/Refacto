import type { Logger } from '../services/LogService';

export class TestLogger implements Logger {
  public readonly logs: Record<string, unknown>[] = [];

  clear() {
    this.logs.length = 0;
  }

  log(record: Record<string, unknown>): void {
    this.logs.push(record);
  }

  error(
    errorType: string,
    err: unknown,
    extra?: Record<string, unknown>,
  ): void {
    this.log({ ...extra, error: errorType, err });
  }
}
