/**
 * Cross-platform Resvg backend contract.
 *
 * Node.js / Vercel Serverless → {@link createNodeResvg} (`@ogify/core/node`)
 * Cloudflare Workers / Vercel Edge → {@link createWasmResvg} (`@ogify/core/wasm`)
 */

/**
 * Fit options passed through to Resvg when rasterizing SVG → PNG.
 */
export type OgResvgFitTo = {
  mode: 'width';
  /** Target width in pixels (height scales proportionally). */
  value: number;
};

/**
 * Options for a single SVG → PNG render.
 */
export type OgResvgRenderOptions = {
  fitTo: OgResvgFitTo;
};

/**
 * Platform-specific SVG → PNG rasterizer.
 *
 * Implementations wrap either `@resvg/resvg-js` (native) or
 * `@resvg/resvg-wasm` (WebAssembly) behind a shared async API.
 */
export type OgResvgBackend = {
  /**
   * Optional stable cache namespace for this backend.
   *
   * Use a different value whenever backend configuration can change PNG output.
   * Backends without one receive an object-identity key per TemplateRenderer.
   */
  cacheKey?: string;

  /**
   * Rasterize an SVG string to a PNG byte array.
   *
   * @returns PNG bytes as `Uint8Array` (also a `Buffer` on Node when using the node backend)
   */
  render(svg: string, options: OgResvgRenderOptions): Promise<Uint8Array>;
};
