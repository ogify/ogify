/**
 * Node.js / Vercel Serverless Resvg backend powered by `@resvg/resvg-js`.
 *
 * Uses native N-API bindings — not available on Cloudflare Workers or Vercel Edge.
 */

import type { OgResvgBackend } from './types';

/**
 * Creates a Resvg backend that uses `@resvg/resvg-js` native bindings.
 *
 * @example
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
export function createNodeResvg(): OgResvgBackend {
  return {
    cacheKey: 'resvg-js@2',
    async render(svg, options) {
      const { renderAsync } = await import('@resvg/resvg-js');
      const pngData = await renderAsync(svg, {
        fitTo: options.fitTo,
      });
      return pngData.asPng();
    },
  };
}
