export async function jsonFetch<T>(
  url: string,
  options: RequestInit,
): Promise<T> {
  const r = await fetch(url, options);
  return readJSON(r, 'error');
}

export async function readJSON<T>(r: Response, errorKey?: string): Promise<T> {
  if (r.status === 404) {
    throw new Error('not found');
  }

  let content: (
    | { [K in string]?: unknown }
    | number
    | boolean
    | string
    | null
  ) &
    T;
  try {
    content = await r.json();
  } catch {
    throw new Error(
      r.ok
        ? 'Connection failed (expected JSON)'
        : `Connection failed (${r.status})`,
    );
  }
  if (
    typeof content === 'object' &&
    content &&
    errorKey &&
    errorKey in content
  ) {
    const message = content[errorKey];
    throw new Error(
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  }
  if (!r.ok) {
    throw new Error(`Connection failed (${r.status})`);
  }
  return content as T;
}
