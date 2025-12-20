export function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

export const randomUUID = window.isSecureContext
  ? () => crypto.randomUUID()
  : () => {
      // If Refacto is deployed without https and running over a network (i.e. not localhost),
      // it will not be in a secure context and will not have access to randomUUID.
      // Users ideally should not deploy refacto like this, but in practice we do not use
      // randomUUID for any security-sensitive purpose, so we can fall-back to our own
      // implementation using getRandomValues (which is available):
      const data = randomBytes(16);
      data[6] = 0x40 | (data[6]! & 0b00001111);
      data[8] = 0b10000000 | (data[8]! & 0b00111111);
      const hex = toHex(data);
      return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
    };

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
  const hashBytes = await crypto.subtle.digest(algorithm, bytes);
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
