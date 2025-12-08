import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderTemplate } from '../src/template';
import type { OgTemplate } from '../src/types';

// Mock dependencies
vi.mock('satori', () => ({
  default: vi.fn().mockResolvedValue('<svg>mock</svg>'),
}));

vi.mock('satori-html', () => ({
  html: vi.fn().mockReturnValue({ type: 'div' }),
}));

vi.mock('@resvg/resvg-js', () => ({
  renderAsync: vi.fn().mockResolvedValue({
    asPng: () => Buffer.from('mock-png'),
  }),
}));

// Mock internal utils
vi.mock('../src/utils/font-loader', () => ({
  loadFonts: vi.fn().mockResolvedValue([]),
}));

vi.mock('../src/utils/additional-asset-loader', () => ({
  loadAdditionalAsset: vi.fn(),
}));

import satori from 'satori';
import { html } from 'satori-html';
import { loadFonts } from '../src/utils/font-loader';

describe('renderTemplate', () => {
  const mockTemplate: OgTemplate = {
    id: 'test',
    name: 'Test',
    description: 'Test',
    renderer: (props) => `<div>${props.params.text}</div>`,
    fonts: [{ name: 'Inter' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute the rendering pipeline correctly', async () => {
    const result = await renderTemplate(mockTemplate, { text: 'Hello' });

    // 1. Check font loading
    expect(loadFonts).toHaveBeenCalledWith(mockTemplate.fonts);

    // 2. Check HTML generation (implicit via satori-html call)
    expect(html).toHaveBeenCalledWith('<div>Hello</div>');

    // 3. Check Satori execution
    expect(satori).toHaveBeenCalledWith(
      { type: 'div' },
      expect.objectContaining({
        width: 1200,
        height: 630,
        fonts: [],
        embedFont: true,
      })
    );

    // 4. Check result
    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString()).toBe('mock-png');
  });

  it('should respect custom dimensions', async () => {
    await renderTemplate(mockTemplate, { text: 'Hello' }, { width: 800, height: 400 });

    expect(satori).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        width: 800,
        height: 400,
      })
    );
  });

  it('should pass width and height to renderer function', async () => {
    const rendererSpy = vi.fn().mockReturnValue('<div></div>');
    const templateWithSpy = { ...mockTemplate, renderer: rendererSpy };

    await renderTemplate(templateWithSpy, { text: 'Hello' }, { width: 100, height: 100 });

    expect(rendererSpy).toHaveBeenCalledWith({
      params: { text: 'Hello' },
      width: 100,
      height: 100,
    });
  });
});
