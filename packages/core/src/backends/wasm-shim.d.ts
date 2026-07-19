/**
 * Ambient typings for the Resvg WASM binary.
 *
 * Bundlers (Wrangler, Vite, webpack with wasm support) turn this into a
 * `WebAssembly.Module` / `Response` at build time. Cloudflare Workers require
 * this kind of static import — runtime `fetch` + `instantiate` is blocked.
 */
declare module '@resvg/resvg-wasm/index_bg.wasm' {
  const wasm: WebAssembly.Module;
  export default wasm;
}
