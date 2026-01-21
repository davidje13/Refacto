export function replaceAll<T>(
  content: string,
  pattern: RegExp,
  replacer: (match: RegExpExecArray, beginIndex: number) => T | string,
  stringMapper: (
    value: string,
    beginIndex: number,
  ) => (T | string) | (T | string)[] = (v) => v,
): (T | string)[] {
  const out: (T | string)[] = [];
  let end = 0;
  while (true) {
    const match = pattern.exec(content);
    if (!match) {
      break;
    }
    if (match.index > end) {
      const parts = stringMapper(content.substring(end, match.index), end);
      if (Array.isArray(parts)) {
        out.push(...parts);
      } else {
        out.push(parts);
      }
    }
    out.push(replacer(match, match.index));
    end = pattern.lastIndex;
  }
  if (content.length > end) {
    const parts = stringMapper(content.substring(end), end);
    if (Array.isArray(parts)) {
      out.push(...parts);
    } else {
      out.push(parts);
    }
  }
  return out;
}
