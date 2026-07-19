/**
 * Cloudflare Workers / Vercel Edge entry — `@resvg/resvg-wasm` backend.
 *
 * Pass a *statically imported* WASM module. Dynamic `fetch()` +
 * `WebAssembly.instantiate` is blocked on Cloudflare Workers.
 *
 * @example
 * ```ts
 * import { createRenderer } from '@ogify/core';
 * import { createWasmResvg } from '@ogify/core/wasm';
 * import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
 *
 * const resvg = await createWasmResvg(resvgWasm);
 * const renderer = createRenderer({
 *   templates: { ... },
 *   resvg,
 *   cache: { type: 'memory' },
 * });
 * ```
 */

export { createWasmResvg } from './backends/wasm';
export type { OgWasmInput } from './backends/wasm';
export type { OgResvgBackend, OgResvgFitTo, OgResvgRenderOptions } from './backends/types';
