import type { Writable } from 'node:stream';

type JSONWriter<T> = (
  value: T,
  context: JSONFormatterContext,
) => Promise<void> | void;

interface JSONType<T> {
  detector: (v: unknown) => v is T;
  writer: JSONWriter<T>;
}

interface JSONFormatterContext {
  write(v: string): void;
  stream(object: unknown, nesting?: number): Promise<void>;
  joiner(
    begin: string,
    end: string,
    nesting?: number,
  ): { next: () => void; end: () => void };
  newline(nesting?: number): void;
  whitespace: boolean;
}

class Builder {
  private readonly types: JSONType<unknown>[] = [];
  private indent: number | string = '';
  private nestingLimit: number = 20;

  constructor(
    private readonly target: (
      ...args: [JSONType<unknown>[], number | string, number]
    ) => JSONFormatter,
  ) {}

  withType<T>(type: JSONType<T>) {
    this.types.unshift(type as JSONType<unknown>);
    return this;
  }

  withIndent(indent: number | string) {
    this.indent = indent;
    return this;
  }

  withNestingLimit(nestingLimit: number) {
    this.nestingLimit = nestingLimit;
    return this;
  }

  build() {
    return this.target([...this.types], this.indent, this.nestingLimit);
  }
}

export class JSONFormatter {
  private readonly newline:
    | ((target: Writable, nesting: number) => void)
    | null;
  private readonly whitespace: boolean;

  private constructor(
    private readonly types: JSONType<unknown>[],
    indent: number | string,
    nestingLimit: number,
  ) {
    if (indent) {
      const indentStep =
        typeof indent === 'number' ? ' '.repeat(indent) : indent;
      const newlines: string[] = [];
      for (let i = 0; i <= nestingLimit; ++i) {
        newlines.push('\n' + indentStep.repeat(i));
      }
      this.newline = (target: Writable, nesting: number) =>
        target.write(newlines[Math.min(nesting, nestingLimit)]);
      this.whitespace = true;
    } else {
      this.newline = null;
      this.whitespace = false;
    }
  }

  static Builder() {
    return new Builder((...args) => new JSONFormatter(...args))
      .withType(JSONFormatter.OBJECT)
      .withType(JSONFormatter.ASYNC_ITERABLE)
      .withType(JSONFormatter.ITERABLE);
  }

  private joiner(
    target: Writable,
    nesting: number,
    begin: string,
    end: string,
  ) {
    let count = 0;
    target.write(begin);
    return {
      next: () => {
        if (count) {
          target.write(',');
        }
        this.newline?.(target, nesting + 1);
        ++count;
      },
      end: () => {
        if (count) {
          this.newline?.(target, nesting);
        }
        target.write(end);
      },
    };
  }

  async stream(target: Writable, object: unknown, nesting: number = 0) {
    if (target.writableNeedDrain) {
      await awaitDrain(target);
    }
    for (const { detector, writer } of this.types) {
      if (detector(object)) {
        await writer(object, {
          write: (v) => target.write(v),
          stream: (subObject: unknown, subNesting: number = 0) =>
            this.stream(target, subObject, nesting + subNesting),
          joiner: (begin: string, end: string, subNesting: number = 0) =>
            this.joiner(target, nesting + subNesting, begin, end),
          newline: (subNesting: number = 0) =>
            this.newline?.(target, nesting + subNesting),
          whitespace: this.whitespace,
        });
        return;
      }
    }
    target.write(JSON.stringify(object ?? null));
  }

  static readonly ITERABLE: JSONType<Iterable<unknown>> = {
    detector: (object): object is Iterable<unknown> =>
      Boolean(
        object && typeof object === 'object' && Symbol.iterator in object,
      ),
    async writer(object, { joiner, stream }) {
      const j = joiner('[', ']');
      for (const v of object) {
        j.next();
        await stream(v, 1);
      }
      j.end();
    },
  };

  static readonly ASYNC_ITERABLE: JSONType<AsyncIterable<unknown>> = {
    detector: (object): object is AsyncIterable<unknown> =>
      Boolean(
        object && typeof object === 'object' && Symbol.asyncIterator in object,
      ),
    async writer(object, { joiner, stream }) {
      const j = joiner('[', ']');
      for await (const v of object) {
        j.next();
        await stream(v, 1);
      }
      j.end();
    },
  };

  static readonly OBJECT: JSONType<object> = {
    detector: (object): object is object =>
      Boolean(object && typeof object === 'object'),
    async writer(object, { write, joiner, stream, whitespace }) {
      const j = joiner('{', '}');
      for (const [k, v] of Object.entries(object)) {
        if (v !== undefined) {
          j.next();
          write(JSON.stringify(k));
          write(whitespace ? ': ' : ':');
          await stream(v, 1);
        }
      }
      j.end();
    },
  };
}

const awaitDrain = (target: Writable) =>
  new Promise<void>((resolve) => target.once('drain', resolve));
