import type { Writable } from 'stream';

type MaybeAsyncIterable<T> = Iterable<T> | AsyncIterable<T>;

export class CSVFormatter {
  private readonly escapedQuote: string;
  constructor(
    private readonly delimiter = ',',
    private readonly newline = '\n',
    private readonly quote = '"',
  ) {
    this.escapedQuote = quote + quote;
  }

  private encodeCSVCell(target: Writable, content: string) {
    if (SIMPLE_CSV_CELL.test(content)) {
      target.write(content);
    } else {
      target.write(this.quote);
      target.write(content.replaceAll(this.quote, this.escapedQuote));
      target.write(this.quote);
    }
  }

  async stream(
    target: Writable,
    rows: MaybeAsyncIterable<MaybeAsyncIterable<string>>,
  ) {
    for await (const row of rows) {
      let col = 0;
      if (Symbol.iterator in row) {
        for (const cell of row) {
          if (target.writableNeedDrain) {
            await awaitDrain(target);
          }
          if (col) {
            target.write(this.delimiter);
          }
          this.encodeCSVCell(target, cell);
          ++col;
        }
      } else {
        for await (const cell of row) {
          if (target.writableNeedDrain) {
            await awaitDrain(target);
          }
          if (col) {
            target.write(this.delimiter);
          }
          this.encodeCSVCell(target, cell);
          ++col;
        }
      }
      target.write(this.newline);
    }
  }
}

const SIMPLE_CSV_CELL = /^[^"':;\\\r\n\t ]*$/i;

const awaitDrain = (target: Writable) =>
  new Promise<void>((resolve) => target.once('drain', resolve));
