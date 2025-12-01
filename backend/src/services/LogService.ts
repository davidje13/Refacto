import { createWriteStream, WriteStream } from 'node:fs';
import { access, constants, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Writable } from 'node:stream';

export interface Logger {
  log(record: Record<string, unknown>): void;
  error(err: unknown, extra?: Record<string, unknown>): void;
}

export class LogService implements Logger {
  private writable: Writable | null = null;
  private reopening: Promise<void> | null = null;
  private closing: Promise<void> | null = null;
  private readonly reopenable: boolean;
  private readonly queue: string[] = [];

  constructor(private readonly filePath: string) {
    if (filePath === '/dev/null') {
      this.reopenable = false;
    } else if (filePath === '/dev/stdout') {
      this.writable = process.stdout;
      this.reopenable = false;
    } else if (filePath === '/dev/stderr') {
      this.writable = process.stderr;
      this.reopenable = false;
    } else {
      const dir = dirname(filePath);
      this.reopenable = true;
      this.reopening = access(dir, constants.X_OK)
        .catch(() => mkdir(dir, { recursive: true, mode: 0o755 }))
        .then(() => {
          if (!this.closing) {
            this.reopening = null;
            this.writable = this._open();
          } else if (this.queue.length > 0) {
            this.writable = this._open();
            return this._close();
          }
          return;
        });
    }
  }

  log(record: Record<string, unknown>) {
    const item = JSON.stringify({ time: Date.now(), ...record }) + '\n';
    if (this.closing) {
      process.stderr.write('logged after closing: ' + item);
    } else if (this.reopening) {
      this.queue.push(item);
    } else if (this.writable) {
      this.writable.write(item);
    }
  }

  error(err: unknown, extra: Record<string, unknown> = {}) {
    this.log({ ...extra, ...parseError(err) });
  }

  reopen() {
    if (!this.reopenable || this.closing) {
      return Promise.resolve();
    }
    if (!this.reopening) {
      this.reopening = this._close().then(() => {
        if (!this.closing) {
          this.reopening = null;
          this.writable = this._open();
        } else if (this.queue.length > 0) {
          this.writable = this._open();
          return this._close();
        }
        return;
      });
    }
    return this.reopening;
  }

  close(): Promise<void> {
    this.closing ??= this.reopening ?? this._close();
    return this.closing;
  }

  private _open() {
    const writable = createWriteStream(this.filePath, {
      flags: 'a',
      mode: 0o640,
      encoding: 'utf-8',
    });
    for (const item of this.queue) {
      writable.write(item);
    }
    this.queue.length = 0;
    return writable;
  }

  private _close() {
    return new Promise<void>((resolve, reject) => {
      const cb = (err: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      };
      if (this.writable instanceof WriteStream) {
        this.writable.close(cb);
      } else if (this.writable) {
        this.writable.write('', cb);
      }
    });
  }
}

function parseError(err: unknown) {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  } else if (typeof err === 'symbol') {
    return { name: typeof err, message: err.description ?? 'unnamed symbol' };
  } else {
    return { name: typeof err, message: String(err) };
  }
}
