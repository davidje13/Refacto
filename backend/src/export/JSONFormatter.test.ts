import { Writable } from 'node:stream';
import { JSONFormatter } from './JSONFormatter';

describe('JSONFormatter', () => {
  it('streams the given JSON object into a buffer', async () => {
    const formatter = JSONFormatter.Builder().build();
    const stream = TestStream();
    await formatter.stream(stream.writable, { foo: 1.2, bar: ['value'] });
    expect(stream.getValue()).toEqual('{"foo":1.2,"bar":["value"]}');
  });

  it('includes whitespace if configured', async () => {
    const formatter = JSONFormatter.Builder().withIndent(2).build();
    const stream = TestStream();
    await formatter.stream(stream.writable, { foo: 1.2, bar: ['value'] });
    expect(stream.getValue()).toEqual(
      '{\n  "foo": 1.2,\n  "bar": [\n    "value"\n  ]\n}',
    );
  });

  it('ignores undefined properties', async () => {
    const formatter = JSONFormatter.Builder().build();
    const stream = TestStream();
    await formatter.stream(stream.writable, {
      foo: false,
      bar: null,
      baz: undefined,
      list: [null, undefined],
    });
    expect(stream.getValue()).toEqual(
      '{"foo":false,"bar":null,"list":[null,null]}',
    );
  });

  it('consumes iterators in the input', async () => {
    const formatter = JSONFormatter.Builder().build();
    const stream = TestStream();
    let advance = () => {};
    const delay = new Promise<void>((resolve) => {
      advance = resolve;
    });
    const itemGenerator = (async function* () {
      yield 1;
      yield 2;
      await delay;
      yield 3;
    })();
    const promise = formatter.stream(stream.writable, { list: itemGenerator });
    await new Promise(process.nextTick);
    expect(stream.getValue()).toEqual('{"list":[1,2');
    advance();
    await promise;
    expect(stream.getValue()).toEqual('{"list":[1,2,3]}');
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
