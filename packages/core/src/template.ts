/**
 * OG image rendering engine.
 *
 * This module provides the core rendering pipeline that converts
 * HTML strings (via satori-html) or JSX / React node trees into PNG images.
 *
 * The rendering process uses:
 * - Satori: Converts HTML/CSS to SVG
 * - Resvg backend: Converts SVG to PNG (native Node or WASM on Edge/Workers)
 */

import satori from 'satori';
import type { ReactNode } from 'react';
import { type SatoriOptions } from 'satori';
import { html } from 'satori-html';

import { resolveResvgBackend } from './backends/resolve';
import type { OgTemplate, OgTemplateOptions, OgTemplateParams } from './types';
import { loadAdditionalAsset } from './utils/additional-asset-loader';
import { loadFonts } from './utils/font-loader';

/**
 * Standard OG image dimensions recommended by the Open Graph protocol.
 *
 * These dimensions provide a 1.91:1 aspect ratio that works optimally
 * across all major social media platforms:
 * - Facebook: Recommends 1200x630
 * - Twitter: Supports 1200x675
 * - LinkedIn: Recommends 1200x630
 * - Discord: Supports 1200x630
 *
 * @see https://ogp.me/#structured
 */
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 630;

/**
 * Renders an OG template to a PNG image byte array.
 *
 * **Rendering Pipeline:**
 *
 * 1. **Font Loading**: Load all fonts specified in the template
 * 2. **Markup generation**: Execute the template's renderer (HTML string or React node tree)
 * 3. **Element tree**: If string, parse with satori-html; otherwise use the returned node tree
 * 4. **SVG Rendering**: Render element tree to SVG using Satori (at original dimensions)
 * 5. **PNG Conversion**: Rasterize SVG via the configured Resvg backend at (width × scale)
 *
 * **Platform backends:**
 * - Node.js / Vercel Serverless: `createNodeResvg()` from `@ogify/core/node` (default on Node)
 * - Cloudflare Workers / Vercel Edge: `createWasmResvg(wasm)` from `@ogify/core/wasm`
 *
 * **Scale / Supersampling:**
 * When `scale > 1`, Resvg rasterizes the vector SVG at a higher resolution
 * (e.g. 2400×1260 for scale=2), producing a @2x retina-quality PNG.
 * Satori always renders at the original dimensions so font sizes and layout
 * remain correct — the quality gain comes from the higher-resolution rasterization.
 *
 * @param template - The template definition to render
 * @param params - Dynamic parameters to populate the template
 * @param options - Optional rendering options
 * @returns Promise resolving to PNG bytes (`Uint8Array`)
 *
 * @throws Will throw if:
 *   - Font loading fails
 *   - HTML generation fails
 *   - SVG rendering fails
 *   - PNG conversion fails
 *   - No Resvg backend is available for the current runtime
 */
export async function renderTemplate<TParams = OgTemplateParams>(
  template: OgTemplate<TParams>,
  params: TParams,
  options?: OgTemplateOptions
): Promise<Uint8Array> {
  const width = options?.width || DEFAULT_WIDTH;
  const height = options?.height || DEFAULT_HEIGHT;
  const fonts = options?.fonts?.length ? options.fonts : template.fonts;
  const emojiProvider = options?.emojiProvider || template.emojiProvider || 'noto';

  // Clamp scale to [1, 4]. Float values supported (e.g. 1.25, 1.5, 2).
  // Math.round is intentionally NOT applied here — it is applied only to the
  // final pixel value in fitTo to avoid sub-pixel Resvg dimensions.
  // undefined/null fall back to 1 (default, no supersampling).
  const scale = Math.max(1, Math.min(4, options?.scale ?? 1));

  const resvg = await resolveResvgBackend(options?.resvg);

  // Step 1: Load all fonts specified in the template
  // Fonts are loaded in parallel for optimal performance
  // The font loader handles three sources: data, URL, and Google Fonts
  const satoriFonts: SatoriOptions['fonts'] = await loadFonts(fonts);

  // Step 2: Run the template renderer (HTML string or React node tree).
  // Template always receives the ORIGINAL width/height — scale is transparent to templates.
  const raw = await template.renderer({
    params,
    ...options,
    width,
    height,
  });

  if (raw == null) {
    throw new Error(
      'Template renderer returned null or undefined; expected an HTML string or a valid React node tree.'
    );
  }

  // Step 3: HTML string → satori-html tree; otherwise use the node tree as-is for Satori.
  const element = typeof raw === 'string' ? html(raw) : raw;

  // Step 4: Render the element tree to SVG using Satori at ORIGINAL dimensions.
  //
  // Key insight: Satori renders at the ORIGINAL width×height (e.g. 1200×630),
  // NOT the scaled dimensions. This ensures all font-size, padding, and layout
  // values in the template HTML are correctly rendered.
  //
  // The SVG output is a vector format — quality scaling happens in Step 5 (Resvg),
  // which can rasterize the same SVG at any resolution without losing fidelity.
  // eslint-disable-next-line
  const svg = await satori(element as ReactNode, {
    width, // original width (e.g. 1200) — NOT scaled
    height, // original height (e.g. 630)  — NOT scaled

    // Loaded fonts for text rendering
    fonts: satoriFonts,

    // Embed fonts in the SVG for portability
    embedFont: true,

    // Satori uses pointScaleFactor to decide how to scale SVG coordinates.
    pointScaleFactor: 2,

    // Dynamic asset loader for emojis and fallback fonts
    // This is called when Satori encounters characters that need special handling
    loadAdditionalAsset: async (code: string, segment: string) => {
      return loadAdditionalAsset({
        code, // Asset type ('emoji' or other)
        segment, // The character(s) to load
        fonts, // Available fonts for fallback detection
        emojiProvider, // Emoji provider (default: noto)
      });
    },
  });

  // Step 5: Rasterize the SVG to PNG using the platform Resvg backend.
  //
  // Since the SVG is a vector format, Resvg can rasterize it at ANY resolution
  // with full quality. When scale > 1, fitTo upscales the output to
  // (width × scale) × (height × scale) pixels, yielding sharper text,
  // anti-aliased edges, and finer gradients compared to scale=1.
  //
  // Output PNG dimensions:
  //   scale=1    → 1200×630   (standard, no change)
  //   scale=1.5  → 1800×945
  //   scale=2    → 2400×1260  (@2x retina)
  //   scale=3    → 3600×1890  (@3x ultra)
  return resvg.render(svg, {
    fitTo: {
      mode: 'width',
      // Math.round ensures integer pixel value (Resvg requires integer dimensions).
      // Examples: scale=1.25 → 1500, scale=1.5 → 1800, scale=2 → 2400
      value: Math.round(width * scale),
    },
  });
}
