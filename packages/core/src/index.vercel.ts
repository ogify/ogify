/**
 * Vercel Edge entry selected by the `edge-light` package condition.
 *
 * Vercel requires the `?module` suffix so the WASM binary is compiled at
 * build time instead of dynamically compiled in the Edge isolate.
 */

import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm?module';

import { registerAutoBackendFactory } from './backends/auto';
import { createWasmResvg } from './backends/wasm';

registerAutoBackendFactory(() => createWasmResvg(resvgWasm), 'edge-light');

export * from './core';
