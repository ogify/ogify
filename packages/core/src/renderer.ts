import satori, { SatoriOptions } from 'satori';
import { html } from 'satori-html';
import type { OGTemplate, TemplateParams } from './types';

// Standard OG image dimensions recommended by Open Graph protocol
// 1200x630 provides a 1.91:1 aspect ratio optimal for social media platforms
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 630;

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

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
 * // Write to file: fs.writeFileSync('og-image.png', imageBuffer);
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
  console.log(fonts); // TODO: Remove debug logging

  // TODO: Fix font handling - currently hardcoded instead of using template.fonts
  // This is a temporary workaround. The proper implementation should:
  // 1. Use fonts from template.fonts array
  // 2. Merge with global fonts from TemplateHandlerConfig
  // 3. Fall back to default fonts only if none provided
  
  const fontName = 'Inter';
  const fontPath = join(process.cwd(), `${fontName}-Regular.ttf`);
  
  // Configure fonts for Satori renderer
  // Satori requires fonts to be explicitly provided as it runs in a headless environment
  const satoriFonts: SatoriOptions['fonts'] = [
    {
      name: fontName,
      data: (await readFile(join(process.cwd(), `Herculanum.ttf`))).buffer, // TODO: Why Herculanum for weight 300?
      weight: 300,
      style: 'normal',
    },
    {
      name: fontName,
      data: (await readFile(fontPath)).buffer,
      weight: 400,
      style: 'normal',
    },
  ];

  // Step 2: Render the element tree to SVG using Satori
  // Satori converts React-like elements to SVG with proper text layout and styling
  const svg = await satori(element, {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    fonts: satoriFonts,
    embedFont: true, // Embed font data in SVG for portability
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
