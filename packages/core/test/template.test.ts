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

  it('should override template fonts with options fonts', async () => {
    const customFonts = [{ name: 'CustomFont' }];
    await renderTemplate(mockTemplate, { text: 'Hello' }, { fonts: customFonts });

    expect(loadFonts).toHaveBeenCalledWith(customFonts);
  });

  it('should override template emojiProvider with options emojiProvider', async () => {
    await renderTemplate(mockTemplate, { text: 'Hello' }, { emojiProvider: 'twemoji' });

    // loadAdditionalAsset is called with the emoji provider
    // We need to trigger it to verify. Since we mock satori, we can't easily trigger the font loading callback
    // unless we inspect the satori call args or mock satori to call the loadAdditionalAsset.
    //
    // However, looking at the code:
    // const satoriFonts = await loadFonts(fonts);
    // ...
    // await satori(..., {
    //   loadAdditionalAsset: (...) => loadAdditionalAsset({ ..., emojiProvider })
    // })
    //
    // We can't directly check the emojiProvider passed to loadAdditionalAsset without executing the callback passed to satori.
    // But we can check if the satori options container has the right structure if we could see the closure.
    //
    // Actually, checking standard implementation:
    // Since we mock satori, we verify the options passed to satori.
    // But loadAdditionalAsset is a function passed to satori.
    // Steps:
    // 1. Call renderTemplate
    // 2. Capture the satori call arguments
    // 3. Execute the loadAdditionalAsset function passed in satori options
    // 4. Verify the internal loadAdditionalAsset was called with correct emojiProvider

    expect(satori).toHaveBeenCalled();
    const satoriCall = vi.mocked(satori).mock.calls[0];
    const satoriOptions = satoriCall[1] as any;

    expect(satoriOptions.loadAdditionalAsset).toBeDefined();

    // Trigger the callback
    await satoriOptions.loadAdditionalAsset('emoji', '👋');

    // Currently loadAdditionalAsset logic uses the provider
    // import { loadAdditionalAsset } from './utils/additional-asset-loader';
    // It's mocked.
    // The implementation of renderTemplate calls actual loadAdditionalAsset utility.

    // Let's import the mocked utility to check
    const { loadAdditionalAsset } = await import('../src/utils/additional-asset-loader');
    expect(loadAdditionalAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        emojiProvider: 'twemoji',
        segment: '👋',
      })
    );
  });
});
