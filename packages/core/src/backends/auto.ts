/**
 * Automatic Resvg backend selection — transparent by default.
 *
 * When the caller omits `resvg`, {@link resolveResvgBackend} uses this helper:
 * 1. Node.js / Vercel Serverless → `@resvg/resvg-js` (native)
 * 2. Edge / Workers / unknown → `@resvg/resvg-wasm` with the package WASM asset
 * 3. Optional `{ wasm }` override if the app already imported a custom module
 *
 * Explicit `resvg` on `createRenderer` / `renderTemplate` always wins.
 */

import type { OgResvgBackend } from './types';
import type { OgWasmInput } from './wasm';
import { detectRuntime } from './runtime';

const NODE_BACKEND_HINT =
  'Install `@resvg/resvg-js` (bundled with `@ogify/core`) or pass `resvg: createNodeResvg()` from `@ogify/core/node`.';

const WASM_BACKEND_HINT =
  'Install `@resvg/resvg-wasm` and ensure your bundler supports `.wasm` imports ' +
  '(Wrangler / Cloudflare Vite plugin do). You can also pass an explicit backend: ' +
  '`resvg: await createWasmResvg(wasmModule)` from `@ogify/core/wasm`.';

export type CreateAutoResvgOptions = {
  /**
   * Optional WASM override. When omitted, core loads
   * `@resvg/resvg-wasm/index_bg.wasm` automatically.
   */
  wasm?: OgWasmInput;
};

let cachedBackend: OgResvgBackend | null = null;
let cacheKey: 'auto' | 'wasm-override' | null = null;

async function loadNodeBackend(): Promise<OgResvgBackend> {
  const { createNodeResvg } = await import('./node');
  return createNodeResvg();
}

async function loadWasmBackend(wasm: OgWasmInput): Promise<OgResvgBackend> {
  const { createWasmResvg } = await import('./wasm');
  return createWasmResvg(wasm);
}

/**
 * Loads the default WASM binary shipped via `@resvg/resvg-wasm`.
 *
 * Uses a dedicated module with a **static** `.wasm` import so Cloudflare
 * Workers / Wrangler can precompile it at deploy time.
 */
async function loadDefaultWasmAsset(): Promise<OgWasmInput> {
  const { defaultWasm } = await import('./wasm-asset');
  return defaultWasm;
}

/**
 * Creates a Resvg backend for the current runtime.
 *
 * Prefer omitting `resvg` on `createRenderer` — this is called automatically.
 * Pass `{ wasm }` only when you need a custom WASM module.
 *
 * @example Transparent (recommended)
 * ```ts
 * import { createRenderer } from '@ogify/core';
 *
 * const renderer = createRenderer({
 *   templates: { ... },
 *   cache: { type: 'memory' },
 * });
 * ```
 *
 * @example Explicit override
 * ```ts
 * import { createRenderer } from '@ogify/core';
 * import { createNodeResvg } from '@ogify/core/node';
 *
 * const renderer = createRenderer({
 *   templates: { ... },
 *   resvg: createNodeResvg(),
 * });
 * ```
 */
export async function createAutoResvg(
  options: CreateAutoResvgOptions = {}
): Promise<OgResvgBackend> {
  if (cachedBackend && !options.wasm && cacheKey === 'auto') {
    return cachedBackend;
  }

  const runtime = detectRuntime();

  // Explicit WASM from the caller
  if (options.wasm) {
    const backend = await loadWasmBackend(options.wasm);
    cachedBackend = backend;
    cacheKey = 'wasm-override';
    return backend;
  }

  // Node → native bindings
  if (runtime === 'node') {
    try {
      const backend = await loadNodeBackend();
      cachedBackend = backend;
      cacheKey = 'auto';
      return backend;
    } catch (nodeError) {
      // Fall through to WASM (e.g. unusual Node without native addons)
      try {
        const wasm = await loadDefaultWasmAsset();
        const backend = await loadWasmBackend(wasm);
        cachedBackend = backend;
        cacheKey = 'auto';
        return backend;
      } catch (wasmError) {
        const nodeDetail = nodeError instanceof Error ? nodeError.message : String(nodeError);
        const wasmDetail = wasmError instanceof Error ? wasmError.message : String(wasmError);
        throw new Error(
          `[@ogify/core] Failed to auto-load a Resvg backend on Node.\n${NODE_BACKEND_HINT}\n${WASM_BACKEND_HINT}\nNode cause: ${nodeDetail}\nWASM cause: ${wasmDetail}`
        );
      }
    }
  }

  // Edge / Workers / unknown → WASM asset from core
  try {
    const wasm = await loadDefaultWasmAsset();
    const backend = await loadWasmBackend(wasm);
    cachedBackend = backend;
    cacheKey = 'auto';
    return backend;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[@ogify/core] Failed to auto-load the WASM Resvg backend on runtime "${runtime}".\n${WASM_BACKEND_HINT}\nCause: ${detail}`
    );
  }
}

/**
 * @internal Clears the cached auto backend (tests only).
 */
export function resetAutoResvgCache(): void {
  cachedBackend = null;
  cacheKey = null;
}
