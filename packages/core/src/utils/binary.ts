/**
 * Binary helpers shared across runtimes.
 *
 * Internal binary normalization uses `Uint8Array`, which works in Node,
 * browsers, Workers, and Edge. Public rendered images remain `Buffer` for
 * backward compatibility.
 */

/**
 * Normalize ArrayBuffer / TypedArray / Buffer-like values to a standalone Uint8Array.
 */
export function toUint8Array(data: ArrayBuffer | ArrayBufferView): Uint8Array {
  if (data instanceof Uint8Array) {
    // Copy Buffer/Uint8Array into a plain Uint8Array view over the same bytes
    // without assuming Buffer exists at the type level.
    return data.byteOffset === 0 && data.byteLength === data.buffer.byteLength
      ? data
      : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }

  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }

  return new Uint8Array(data);
}

/**
 * Convert binary input to a standalone ArrayBuffer for APIs (e.g. Satori) that
 * type `data` as `ArrayBuffer | Buffer` rather than `Uint8Array`.
 */
export function toArrayBuffer(data: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  if (data instanceof ArrayBuffer) {
    return data;
  }

  const view = toUint8Array(data);
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
}
