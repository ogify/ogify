import satori from 'satori'
import type { FontConfig } from './types'

/**
 * Render OG image using Satori and Resvg
 */
export async function renderToImage(
  element: any,
  options: {
    width: number
    height: number
    format?: 'png' | 'svg'
    fonts?: FontConfig[]
  }
): Promise<Buffer> {
  const { width, height, format = 'png', fonts = [] } = options

  // Convert FontConfig to Satori font format
  const satoriFonts =
    fonts?.map((font) => ({
      name: font.name,
      data: font.data,
      weight: (font.weight || 400) as any,
      style: font.style || 'normal',
    })) || []

  // Add default system font if no fonts provided
  if (satoriFonts.length === 0) {
    // Satori requires at least one font, so we'll use a minimal fallback
    // This will use Satori's built-in font handling
    satoriFonts.push({
      name: 'Arial',
      data: Buffer.from(''), // Empty buffer - Satori will use system fonts
      weight: 400,
      style: 'normal',
    })
  }

  // Render SVG with Satori
  const svg = await satori(element, {
    width,
    height,
    fonts: satoriFonts,
  })

  if (format === 'svg') {
    return Buffer.from(svg)
  }

  // Convert SVG to PNG using Resvg
  try {
    const { renderAsync } = await import('@resvg/resvg-js')
    const pngData = await renderAsync(svg, {
      fitTo: {
        mode: 'width',
        value: width,
      },
    })
    return Buffer.from(pngData.asPng())
  } catch (error) {
    // Fallback to returning SVG if Resvg is not available
    console.warn('Resvg not available, returning SVG instead of PNG')
    return Buffer.from(svg)
  }
}

/**
 * Render template to image
 */
export async function renderTemplateToImage<T>(
  template: any,
  params: T,
  options: {
    width?: number
    height?: number
    format?: 'png' | 'svg'
    fonts?: FontConfig[]
    theme?: any
  } = {}
): Promise<Buffer> {
  const { width = 1200, height = 630, format = 'png', fonts = [], theme } = options

  // Render template component
  const element = template.component({
    params,
    theme,
    width,
    height,
  })

  // Render to image
  return renderToImage(element, {
    width,
    height,
    format,
    fonts,
  })
}