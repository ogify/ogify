/**
 * Node.js / Vercel Serverless entry — native `@resvg/resvg-js` backend.
 *
 * @example
 * ```ts
 * import { createRenderer } from '@ogify/core';
 * import { createNodeResvg } from '@ogify/core/node';
 *
 * const renderer = createRenderer({
 *   templates: { ... },
 *   resvg: createNodeResvg(),
 *   cache: { type: 'memory' }, // or 'filesystem' on Node
 * });
 * ```
 */

export { createNodeResvg } from './backends/node';
export type { OgResvgBackend, OgResvgFitTo, OgResvgRenderOptions } from './backends/types';
