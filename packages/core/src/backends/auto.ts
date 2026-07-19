/**
 * Automatic Resvg backend selection.
 *
 * Resolution order when `resvg` is omitted (or when calling {@link createAutoResvg}):
 * 1. Node.js / Vercel Serverless → `@resvg/resvg-js` via {@link createNodeResvg}
 * 2. Edge / Workers with `wasm` option → `@resvg/resvg-wasm` via {@link createWasmResvg}
 * 3. Edge / Workers without `wasm` → attempt to load `@resvg/resvg-wasm/index_bg.wasm`
 *    (works with bundlers that rewrite `.wasm` imports; Cloudflare often needs a
 *    *static* import in app code — pass `{ wasm }` in that case)
 */

import type { OgResvgBackend } from './types';
import type { OgWasmInput } from './wasm';
import { detectRuntime } from './runtime';

const NODE_BACKEND_HINT =
  'For Node.js / Vercel Serverless: import { createNodeResvg } from "@ogify/core/node" and pass `resvg: createNodeResvg()`.';

const WASM_BACKEND_HINT =
  'For Cloudflare Workers / Vercel Edge: statically import the WASM module and pass it:\n' +
  '  import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";\n' +
  '  resvg: await createAutoResvg({ wasm: resvgWasm })\n' +
  'or: resvg: await createWasmResvg(resvgWasm)';

export type CreateAutoResvgOptions = {
  /**
   * WASM module / bytes for Edge and Workers.
   *
   * Prefer a statically imported module on Cloudflare Workers
   * (`import wasm from '@resvg/resvg-wasm/index_bg.wasm'`).
   */
  wasm?: OgWasmInput;
};

let cachedBackend: OgResvgBackend | null = null;
let cachedWithExplicitWasm = false;

/**
 * Tries to load the default WASM asset shipped by `@resvg/resvg-wasm`.
 *
 * Uses an indirect dynamic import so library bundlers do not fail at build time
 * when the consumer's bundler does not understand `.wasm` files.
 */
async function importDefaultWasm(): Promise<OgWasmInput> {
  const specifier = '@resvg/resvg-wasm/index_bg.wasm';
  // Indirect import avoids static analysis failures in tsup / some TS setups.
  const dynamicImport = new Function('s', 'return import(s)') as (
    s: string
  ) => Promise<{ default?: OgWasmInput } | OgWasmInput>;
  const mod = await dynamicImport(specifier);

  if (mod && typeof mod === 'object' && 'default' in mod && mod.default) {
    return mod.default;
  }

  return mod as OgWasmInput;
}

async function loadNodeBackend(): Promise<OgResvgBackend> {
  const { createNodeResvg } = await import('./node');
  return createNodeResvg();
}

async function loadWasmBackend(wasm: OgWasmInput): Promise<OgResvgBackend> {
  const { createWasmResvg } = await import('./wasm');
  return createWasmResvg(wasm);
}

/**
 * Creates a Resvg backend for the current runtime.
 *
 * @example Node — fully automatic
 * ```ts
 * const renderer = createRenderer({
 *   templates: { ... },
 *   // resvg omitted → createAutoResvg() is used internally
 * });
 * ```
 *
 * @example Cloudflare Workers — pass statically imported WASM once
 * ```ts
 * import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
 * const renderer = createRenderer({
 *   templates: { ... },
 *   resvg: await createAutoResvg({ wasm: resvgWasm }),
 * });
 * ```
 */
export async function createAutoResvg(
  options: CreateAutoResvgOptions = {}
): Promise<OgResvgBackend> {
  // Reuse cached backend when no explicit wasm override is provided
  if (cachedBackend && !options.wasm && !cachedWithExplicitWasm) {
    return cachedBackend;
  }

  const runtime = detectRuntime();

  if (runtime === 'node') {
    try {
      const backend = await loadNodeBackend();
      if (!options.wasm) {
        cachedBackend = backend;
        cachedWithExplicitWasm = false;
      }
      return backend;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      // Unusual: Node without native bindings — try WASM if provided
      if (options.wasm) {
        return loadWasmBackend(options.wasm);
      }
      throw new Error(
        `[@ogify/core] Failed to load the Node Resvg backend (@resvg/resvg-js).\n${NODE_BACKEND_HINT}\n${WASM_BACKEND_HINT}\nCause: ${detail}`
      );
    }
  }

  // Edge / unknown → WASM
  if (options.wasm) {
    const backend = await loadWasmBackend(options.wasm);
    cachedBackend = backend;
    cachedWithExplicitWasm = true;
    return backend;
  }

  try {
    const wasm = await importDefaultWasm();
    const backend = await loadWasmBackend(wasm);
    cachedBackend = backend;
    cachedWithExplicitWasm = false;
    return backend;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[@ogify/core] Automatic Resvg selection needs a WASM module on this runtime (${runtime}).\n${WASM_BACKEND_HINT}\nCause: ${detail}`
    );
  }
}

/**
 * @internal Clears the cached auto backend (tests only).
 */
export function resetAutoResvgCache(): void {
  cachedBackend = null;
  cachedWithExplicitWasm = false;
}
