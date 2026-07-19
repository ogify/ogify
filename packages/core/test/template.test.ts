import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Buffer as RuntimeBuffer } from 'buffer';
import { renderTemplate } from '../src/template';
import type { OgResvgBackend } from '../src/backends/types';
import type { OgTemplate } from '../src/types';

// Mock dependencies
vi.mock('satori', () => ({
  default: vi.fn().mockResolvedValue('<svg>mock</svg>'),
}));

vi.mock('satori-html', () => ({
  html: vi.fn().mockReturnValue({ type: 'div' }),
}));

vi.mock('../src/utils/font-loader', () => ({
  loadFonts: vi.fn().mockResolvedValue([]),
}));

vi.mock('../src/utils/additional-asset-loader', () => ({
  loadAdditionalAsset: vi.fn(),
}));

import satori from 'satori';
import { html } from 'satori-html';
import { loadFonts } from '../src/utils/font-loader';

function createMockResvg(): OgResvgBackend & { render: ReturnType<typeof vi.fn> } {
  return {
    render: vi.fn().mockResolvedValue(new Uint8Array([109, 111, 99, 107])), // "mock"
  };
}

describe('renderTemplate', () => {
  const mockTemplate: OgTemplate = {
    renderer: (props) => `<div>${props.params.text}</div>`,
    fonts: [{ name: 'Inter' }],
  };

  let resvg: ReturnType<typeof createMockResvg>;

  beforeEach(() => {
    vi.clearAllMocks();
    resvg = createMockResvg();
  });

  it('should pass a React-like node to satori without calling html', async () => {
    const node = { type: 'div', props: { children: 'Hello' } };
    const jsxTemplate: OgTemplate = {
      ...mockTemplate,
      renderer: () => node as any,
    };

    await renderTemplate(jsxTemplate, { text: 'Hello' }, { resvg });

    expect(html).not.toHaveBeenCalled();
    expect(satori).toHaveBeenCalledWith(
      node,
      expect.objectContaining({
        width: 1200,
        height: 630,
        fonts: [],
        embedFont: true,
      })
    );
  });

  it('should throw when renderer returns null', async () => {
    const badTemplate: OgTemplate = {
      ...mockTemplate,
      renderer: () => null as any,
    };

    await expect(renderTemplate(badTemplate, { text: 'Hello' }, { resvg })).rejects.toThrow(
      /null or undefined/
    );
  });

  it('should execute the rendering pipeline correctly', async () => {
    const result = await renderTemplate(mockTemplate, { text: 'Hello' }, { resvg });

    expect(loadFonts).toHaveBeenCalledWith(mockTemplate.fonts);
    expect(html).toHaveBeenCalledWith('<div>Hello</div>');
    expect(satori).toHaveBeenCalledWith(
      { type: 'div' },
      expect.objectContaining({
        width: 1200,
        height: 630,
        fonts: [],
        embedFont: true,
      })
    );
    expect(RuntimeBuffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe('mock');
  });

  it('should respect custom dimensions', async () => {
    await renderTemplate(mockTemplate, { text: 'Hello' }, { width: 800, height: 400, resvg });

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

    await renderTemplate(templateWithSpy, { text: 'Hello' }, { width: 100, height: 100, resvg });

    expect(rendererSpy).toHaveBeenCalledWith({
      params: { text: 'Hello' },
      width: 100,
      height: 100,
      resvg,
    });
  });

  it('should override template fonts with options fonts', async () => {
    const customFonts = [{ name: 'CustomFont' }];
    await renderTemplate(mockTemplate, { text: 'Hello' }, { fonts: customFonts, resvg });

    expect(loadFonts).toHaveBeenCalledWith(customFonts);
  });

  it('should override template emojiProvider with options emojiProvider', async () => {
    await renderTemplate(mockTemplate, { text: 'Hello' }, { emojiProvider: 'twemoji', resvg });

    expect(satori).toHaveBeenCalled();
    const satoriCall = vi.mocked(satori).mock.calls[0];
    const satoriOptions = satoriCall[1] as any;

    expect(satoriOptions.loadAdditionalAsset).toBeDefined();
    await satoriOptions.loadAdditionalAsset('emoji', '👋');

    const { loadAdditionalAsset } = await import('../src/utils/additional-asset-loader');
    expect(loadAdditionalAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        emojiProvider: 'twemoji',
        segment: '👋',
      })
    );
  });

  describe('scale option', () => {
    it('should use default scale=1 when scale is not provided', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { resvg });

      expect(satori).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 1200,
          height: 630,
        })
      );
      expect(resvg.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fitTo: { mode: 'width', value: 1200 },
        })
      );
    });

    it('should keep Satori at original dims and upscale Resvg fitTo when scale=2', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 2, resvg });

      expect(satori).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 1200,
          height: 630,
        })
      );
      expect(resvg.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fitTo: { mode: 'width', value: 2400 },
        })
      );
    });

    it('should keep Satori at original dims and upscale Resvg fitTo when scale=3', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 3, resvg });

      expect(satori).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 1200,
          height: 630,
        })
      );
      expect(resvg.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fitTo: { mode: 'width', value: 3600 },
        })
      );
    });

    it('should handle float scale values (e.g. 1.5) by rounding only the final Resvg fitTo value', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 1.5, resvg });

      expect(satori).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 1200,
          height: 630,
        })
      );
      expect(resvg.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fitTo: { mode: 'width', value: 1800 },
        })
      );
    });

    it('should pass original width/height to template renderer regardless of scale', async () => {
      const rendererSpy = vi.fn().mockReturnValue('<div></div>');
      const templateWithSpy = { ...mockTemplate, renderer: rendererSpy };

      await renderTemplate(
        templateWithSpy,
        { text: 'Hello' },
        { width: 1200, height: 630, scale: 3, resvg }
      );

      expect(rendererSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 1200,
          height: 630,
        })
      );
    });

    it('should clamp scale=0 to 1 — Satori at original, Resvg fitTo original', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 0, resvg });

      expect(satori).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 1200,
          height: 630,
        })
      );
      expect(resvg.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fitTo: { mode: 'width', value: 1200 },
        })
      );
    });

    it('should clamp scale=5 to 4 — Resvg fitTo width*4', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 5, resvg });

      expect(satori).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 1200,
          height: 630,
        })
      );
      expect(resvg.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fitTo: { mode: 'width', value: 4800 },
        })
      );
    });
  });
});
