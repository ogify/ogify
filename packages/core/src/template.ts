/**
 * OG image rendering engine.
 *
 * This module provides the core rendering pipeline that converts
 * HTML templates into PNG images suitable for Open Graph meta tags.
 *
 * The rendering process uses:
 * - Satori: Converts HTML/CSS to SVG
 * - Resvg: Converts SVG to PNG with high quality
 */

import satori from 'satori';
import { type SatoriOptions } from 'satori';
import { html } from 'satori-html';
import { renderAsync } from '@resvg/resvg-js';

import type { OgTemplate, OgTemplateParams } from './types';
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
 * Renders an OG template to a PNG image buffer.
 *
 * **Rendering Pipeline:**
 *
 * 1. **Font Loading**: Load all fonts specified in the template
 * 2. **HTML Generation**: Execute the template's renderer function with parameters
 * 3. **HTML to Element Tree**: Convert HTML string to React-like element tree
 * 4. **SVG Rendering**: Render element tree to SVG using Satori
 * 5. **PNG Conversion**: Convert SVG to PNG using Resvg
 *
 * @param template - The template definition to render
 * @param params - Dynamic parameters to populate the template
 * @param options - Optional rendering options
 * @param options.width - Custom image width in pixels (default: 1200)
 * @param options.height - Custom image height in pixels (default: 630)
 * @returns Promise resolving to a PNG image buffer
 *
 * @throws Will throw if:
 *   - Font loading fails
 *   - HTML generation fails
 *   - SVG rendering fails
 *   - PNG conversion fails
 */
export async function renderTemplate<TParams = OgTemplateParams>(
  template: OgTemplate<TParams>,
  params: TParams,
  options?: { width: number; height: number }
): Promise<Buffer> {
  const width = options?.width || DEFAULT_WIDTH;
  const height = options?.height || DEFAULT_HEIGHT;

  // Step 1: Load all fonts specified in the template
  // Fonts are loaded in parallel for optimal performance
  // The font loader handles three sources: data, URL, and Google Fonts
  const satoriFonts: SatoriOptions['fonts'] = await loadFonts(template.fonts);

  // Step 2: Generate HTML string from the template function
  // The template receives the user parameters and width/height for responsive layouts
  const htmlString = await template.renderer({
    params: typeof params === 'function' ? await params() : params,
    width,
    height,
  });

  // Step 3: Convert HTML string to React-like element tree
  // satori-html parses the HTML and creates a structure Satori can understand
  const element = html(htmlString);

  // Step 4: Render the element tree to SVG using Satori
  // Satori converts the element tree to SVG with proper text rendering,
  // layout calculations, and font embedding
  // eslint-disable-next-line
  const svg = await satori(element as any, {
    // Image dimensions (customizable via options parameter)
    width,
    height,

    // Loaded fonts for text rendering
    fonts: satoriFonts,

    // Embed fonts in the SVG for portability
    embedFont: true,

    // Dynamic asset loader for emojis and fallback fonts
    // This is called when Satori encounters characters that need special handling
    loadAdditionalAsset: async (code: string, segment: string) => {
      return loadAdditionalAsset({
        code, // Asset type ('emoji' or other)
        segment, // The character(s) to load
        fonts: template.fonts, // Available fonts for fallback detection
        emojiProvider: template.emojiProvider || 'noto', // Emoji provider (default: noto)
      });
    },
  });

  // Step 5: Convert SVG to PNG using Resvg
  // Resvg is a high-quality SVG renderer that produces sharp PNG images
  // Render SVG to PNG with width-based scaling
  // The 'width' mode maintains aspect ratio while ensuring the image matches the specified width
  const pngData = await renderAsync(svg, {
    fitTo: {
      mode: 'width', // Scale based on width, maintain aspect ratio
      value: width,
    },
  });

  // Step 6: Convert Uint8Array to Node.js Buffer for compatibility
  // Buffer is more widely supported in Node.js ecosystems
  return Buffer.from(pngData.asPng());
}
