export function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

export function toHex(array: Uint8Array): string {
  return [...array].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export async function sha1(data: string): Promise<string> {
  const bytes = new TextEncoder().encode(data);
  const hashBytes = await window.crypto.subtle.digest('SHA-1', bytes);
  return toHex(new Uint8Array(hashBytes));
}
