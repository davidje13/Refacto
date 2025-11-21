export function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

export function toHex(array: Uint8Array): string {
  return [...array].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function toB64(array: Uint8Array): string {
  if (array.toBase64) {
    return array.toBase64({ alphabet: 'base64url', omitPadding: true });
  } else {
    // fallback toBase64 for old browsers
    return btoa(String.fromCharCode(...array))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '');
  }
}

export async function digest(
  data: string,
  algorithm: AlgorithmIdentifier,
): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(data);
  const hashBytes = await window.crypto.subtle.digest(algorithm, bytes);
  return new Uint8Array(hashBytes);
}

declare global {
  interface Uint8Array {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64
    toBase64?: (options?: {
      alphabet?: 'base64' | 'base64url';
      omitPadding?: boolean;
    }) => string;
  }
}
