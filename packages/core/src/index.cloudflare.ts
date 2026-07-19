/**
 * Cloudflare Workers / Pages entry selected by the `workerd` package condition.
 *
 * Wrangler turns a plain static `.wasm` import into a precompiled
 * `WebAssembly.Module`.
 */

import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';

import { registerAutoBackendFactory } from './backends/auto';
import { createWasmResvg } from './backends/wasm';

registerAutoBackendFactory(() => createWasmResvg(resvgWasm), 'workerd');

export * from './core';
