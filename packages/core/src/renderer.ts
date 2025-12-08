import satori from 'satori';
import { type SatoriOptions } from 'satori';
import { html } from 'satori-html';

import type { OGTemplate, TemplateParams } from './types';
import { loadAdditionalAsset } from './utils/additional-asset-loader';
import { loadFonts } from './utils/font-loader';

// Standard OG image dimensions recommended by Open Graph protocol
// 1200x630 provides a 1.91:1 aspect ratio optimal for social media platforms
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 630;

/**
 * Renders an OG template to a PNG image buffer.
 *
 * The rendering pipeline:
 * 1. Generate HTML from template function
 * 2. Convert HTML to React-like element tree (satori-html)
 * 3. Render element tree to SVG (satori)
 * 4. Convert SVG to PNG (resvg)
 *
 * @param template - The template definition to render
 * @param params - Dynamic parameters to populate the template
 * @returns Promise resolving to a PNG image buffer
 *
 * @example
 * const imageBuffer = await renderOgImage(myTemplate, { title: 'Hello World' });
 */
export async function renderOgImage(template: OGTemplate, params: TemplateParams): Promise<Buffer> {
  // Step 1: Extract fonts from template
  const satoriFonts: SatoriOptions['fonts'] = await loadFonts(template.fonts);

  // Step 2: Generate HTML string from template function
  const element = html(
    template.html({
      params,
    })
  );

  // Step 3: Render the element tree to SVG using Satori
  const svg = await satori(element, {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    fonts: satoriFonts,
    embedFont: true,
    loadAdditionalAsset: async (code: string, segment: string) => {
      return loadAdditionalAsset({
        code,
        segment,
        fonts: template.fonts,
        emojiProvider: template.emojiProvider || 'noto',
      });
    },
  });

  // Step 4: Convert SVG to PNG using resvg
  const { renderAsync } = await import('@resvg/resvg-js');

  // Render SVG to PNG with width-based scaling
  const pngData = await renderAsync(svg, {
    fitTo: {
      mode: 'width', // Maintain aspect ratio based on width
      value: DEFAULT_WIDTH,
    },
  });

  // Convert Uint8Array to Node.js Buffer for compatibility
  return Buffer.from(pngData.asPng());
}
