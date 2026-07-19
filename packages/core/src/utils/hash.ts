/**
 * Cross-platform hashing helpers (Web Crypto — works in Node 18+, Workers, Edge).
 */

/**
 * SHA-256 hex digest of a UTF-8 string.
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}
