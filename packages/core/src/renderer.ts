import satori, { SatoriOptions } from 'satori';
import { html } from 'satori-html';
import type { OGTemplate, TemplateParams } from './types';

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
  // Step 1: Generate HTML string from template function
  const element = html(
    template.html({
      params,
    })
  );

  // Extract fonts from template (defaults to empty array if not provided)
  const { fonts = [] } = template;

  // Configure fonts for Satori renderer
  // Satori requires fonts to be explicitly provided as it runs in a headless environment
  const satoriFonts: SatoriOptions['fonts'] = [];

  for (const font of fonts) {
    let fontData: Buffer | ArrayBuffer;
    if ('url' in font) {
      fontData = await (await fetch(font.url)).arrayBuffer();
    } else {
      fontData = font.data;
    }
    satoriFonts.push({
      name: font.name,
      data: fontData,
      // weight: font.weight,
      style: font.style,
    });
  }

  // Step 2: Render the element tree to SVG using Satori
  // Satori converts React-like elements to SVG with proper text layout and styling
  const svg = await satori(element, {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    fonts: satoriFonts,
    embedFont: true, // Embed font data in SVG for portability
    loadAdditionalAsset: async (code: string, segment: string) => {
      console.log('Loading additional asset:', code, segment);
      return satoriFonts.filter((font) => font.name.includes('Fallback'));
    },
  });

  // Step 3: Convert SVG to PNG using resvg (Rust-based SVG renderer)
  // Dynamic import to reduce initial bundle size
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
