/**
 * Resolves the Resvg backend to use for a render call.
 *
 * Priority:
 * 1. Explicit `resvg` passed by the caller
 * 2. Lazy Node.js default (`@resvg/resvg-js`) when running on Node
 *
 * Edge / Workers must always pass an explicit backend from `@ogify/core/wasm`.
 */

import type { OgResvgBackend } from './types';

const NODE_BACKEND_HINT =
  'For Node.js / Vercel Serverless: import { createNodeResvg } from "@ogify/core/node" and pass `resvg: createNodeResvg()`.';

const WASM_BACKEND_HINT =
  'For Cloudflare Workers / Vercel Edge: import { createWasmResvg } from "@ogify/core/wasm" and pass `resvg: await createWasmResvg(wasmModule)`.';

function isNodeRuntime(): boolean {
  return (
    typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    typeof process.versions?.node === 'string'
  );
}

/**
 * Returns the backend to use, falling back to the Node native backend when possible.
 *
 * @throws Error when no backend is provided and Node bindings cannot be loaded
 */
export async function resolveResvgBackend(
  explicit?: OgResvgBackend
): Promise<OgResvgBackend> {
  if (explicit) {
    return explicit;
  }

  if (!isNodeRuntime()) {
    throw new Error(
      `[@ogify/core] No Resvg backend configured for this runtime.\n${WASM_BACKEND_HINT}\n${NODE_BACKEND_HINT}`
    );
  }

  try {
    const { createNodeResvg } = await import('./node');
    return createNodeResvg();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[@ogify/core] Failed to load the Node Resvg backend (@resvg/resvg-js).\n${NODE_BACKEND_HINT}\n${WASM_BACKEND_HINT}\nCause: ${detail}`
    );
  }
}
