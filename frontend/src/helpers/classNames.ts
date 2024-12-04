type ClassNamePart = string | Record<string, boolean> | null | undefined;

export function classNames(...parts: ClassNamePart[]): string {
  const r: string[] = [];
  for (const part of parts) {
    if (part) {
      if (typeof part === 'string') {
        r.push(part);
      } else {
        r.push(
          ...Object.entries(part)
            .filter(([, v]) => v)
            .map(([k]) => k),
        );
      }
    }
  }
  return r.join(' ');
}
