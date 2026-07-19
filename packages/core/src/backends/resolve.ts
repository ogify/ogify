/**
 * Resolves the Resvg backend to use for a render call.
 *
 * Priority:
 * 1. Explicit `resvg` from the caller (always wins)
 * 2. Transparent auto-detection via {@link createAutoResvg}
 */

import type { OgResvgBackend } from './types';
import { createAutoResvg } from './auto';

/**
 * Returns the backend to use.
 *
 * Callers should normally omit `resvg` and let this auto-select.
 * Pass an explicit backend only to override.
 */
export async function resolveResvgBackend(
  explicit?: OgResvgBackend
): Promise<OgResvgBackend> {
  if (explicit) {
    return explicit;
  }

  return createAutoResvg();
}
