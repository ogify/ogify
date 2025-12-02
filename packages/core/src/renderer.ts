import satori from 'satori';
import { html } from 'satori-html';
import type { OGTemplate, TemplateParams } from './types';

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 630;
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Render template to image
 */
export async function renderOgImage(template: OGTemplate, params: TemplateParams): Promise<Buffer> {
  // Render template component
  const element = html(
    template.html({
      params,
    })
  );

  const { fonts = [] } = template;
  console.log(fonts);

  // Convert FontConfig to Satori font format

  const fontName = 'Inter';
  const fontPath = join(process.cwd(), `${fontName}-Regular.ttf`);
  const satoriFonts = [
    {
      name: fontName,
      data: (await readFile(fontPath)).buffer,
      // weight: 400,
      // style: 'normal',
    },
  ];

  console.log('satoriFonts', satoriFonts);

  // If no fonts provided, Satori will use its default fonts

  // Render SVG with Satori
  const svg = await satori(element, {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    fonts: satoriFonts,
    embedFont: true,
  });

  const { renderAsync } = await import('@resvg/resvg-js');

  const pngData = await renderAsync(svg, {
    fitTo: {
      mode: 'width',
      value: DEFAULT_WIDTH,
    },
  });

  return Buffer.from(pngData.asPng());
}
