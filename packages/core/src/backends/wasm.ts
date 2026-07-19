/**
 * Edge / Workers Resvg backend powered by `@resvg/resvg-wasm`.
 *
 * Compatible with Cloudflare Workers, Cloudflare Pages Functions, and Vercel Edge.
 *
 * Important: pass a *statically imported* WASM module (or Response from a
 * module worker binding). Fetching WASM bytes at runtime and calling
 * `WebAssembly.instantiate` is blocked on Cloudflare Workers.
 *
 * @example Cloudflare Worker (wrangler)
 * ```ts
 * import { createRenderer } from '@ogify/core';
 * import { createWasmResvg } from '@ogify/core/wasm';
 * // wrangler / esbuild turns this into a WebAssembly.Module
 * import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
 *
 * const resvg = await createWasmResvg(resvgWasm);
 * const renderer = createRenderer({ templates: { ... }, resvg });
 * ```
 */

import type { OgResvgBackend } from './types';

/**
 * Accepted inputs for WASM initialization.
 *
 * Prefer a statically imported `WebAssembly.Module` on Cloudflare Workers.
 * `Response` / `BufferSource` work in many bundlers (e.g. when using `?module`).
 */
export type OgWasmInput =
  | BufferSource
  | WebAssembly.Module
  | Response
  | PromiseLike<Response>;

let wasmInitPromise: Promise<void> | null = null;

/**
 * Ensures `@resvg/resvg-wasm` is initialized exactly once per isolate.
 */
async function ensureWasmInitialized(wasm: OgWasmInput): Promise<void> {
  if (!wasmInitPromise) {
    wasmInitPromise = (async () => {
      const { initWasm } = await import('@resvg/resvg-wasm');
      try {
        await initWasm(wasm);
      } catch (error) {
        // initWasm throws if called twice in the same isolate
        const message = error instanceof Error ? error.message : String(error);
        if (!/already initialized/i.test(message)) {
          wasmInitPromise = null;
          throw error;
        }
      }
    })();
  }

  await wasmInitPromise;
}

/**
 * Creates a Resvg backend that uses `@resvg/resvg-wasm`.
 *
 * Call once at module/worker startup and reuse the returned backend.
 *
 * @param wasm - Statically imported WASM module, bytes, or Response
 */
export async function createWasmResvg(wasm: OgWasmInput): Promise<OgResvgBackend> {
  await ensureWasmInitialized(wasm);

  const { Resvg } = await import('@resvg/resvg-wasm');

  return {
    async render(svg, options) {
      const renderer = new Resvg(svg, {
        fitTo: options.fitTo,
      });
      return renderer.render().asPng();
    },
  };
}
