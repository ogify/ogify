/**
 * Default WASM asset for Edge / Workers auto-selection.
 *
 * Kept in its own module so Node consumers never load it unless the Edge path
 * runs. The import is **static** so Wrangler / esbuild can precompile the WASM
 * module (required on Cloudflare Workers).
 */

// Static import — do not change to a runtime fetch().
import defaultWasm from '@resvg/resvg-wasm/index_bg.wasm';

export { defaultWasm };
