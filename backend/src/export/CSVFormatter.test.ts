import { Writable } from 'node:stream';
import { CSVFormatter } from './CSVFormatter';

describe('CSVFormatter', () => {
  it('streams the given CSV table into a buffer', async () => {
    const formatter = new CSVFormatter();
    const stream = TestStream();
    await formatter.stream(stream.writable, [
      ['a', 'b'],
      ['c', 'd'],
    ]);
    expect(stream.getValue()).toEqual('a,b\nc,d\n');
  });

  it('quotes values with special characters', async () => {
    const formatter = new CSVFormatter();
    const stream = TestStream();
    await formatter.stream(stream.writable, [['a\nb', 'c"']]);
    expect(stream.getValue()).toEqual('"a\nb","c"""\n');
  });

  it('consumes iterators in the input', async () => {
    const formatter = new CSVFormatter();
    const stream = TestStream();
    let advance = () => {};
    const delay = new Promise<void>((resolve) => {
      advance = resolve;
    });
    const rowGenerator = (async function* () {
      yield ['a', 'b'];
      await delay;
      yield ['c', 'd'];
    })();
    const promise = formatter.stream(stream.writable, rowGenerator);
    await new Promise(process.nextTick);
    expect(stream.getValue()).toEqual('a,b\n');
    advance();
    await promise;
    expect(stream.getValue()).toEqual('a,b\nc,d\n');
  });
});

const TestStream = () => {
  const chunks: string[] = [];
  return {
    writable: new Writable({
      write(chunk, _, callback) {
        chunks.push(chunk);
        callback();
      },
    }),
    getValue: () => chunks.join(''),
  };
};
