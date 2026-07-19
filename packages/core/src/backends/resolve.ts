/**
 * Resolves the Resvg backend to use for a render call.
 *
 * Priority:
 * 1. Explicit `resvg` passed by the caller
 * 2. {@link createAutoResvg} — Node → native, Edge/Workers → WASM
 */

import type { OgResvgBackend } from './types';
import { createAutoResvg } from './auto';

/**
 * Returns the backend to use, auto-selecting when none is provided.
 *
 * @throws Error when no backend can be loaded for the current runtime
 */
export async function resolveResvgBackend(
  explicit?: OgResvgBackend
): Promise<OgResvgBackend> {
  if (explicit) {
    return explicit;
  }

  return createAutoResvg();
}
