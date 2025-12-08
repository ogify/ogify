import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleFontDetector } from '../../src/utils/google-font-detector';
import type { OgFontConfig } from '../../src/types';

describe('GoogleFontDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCss = `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      src: url(https://fonts.gstatic.com/latin.woff2) format('woff2');
      unicode-range: U+0000-00FF, U+0131;
    }
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      src: url(https://fonts.gstatic.com/chinese.woff2) format('woff2');
      unicode-range: U+4E00-9FFF;
    }
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      src: url(https://fonts.gstatic.com/fallback.woff2) format('woff2');
    }
  `;

  it('should fetch and parse CSS correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(mockCss),
    });

    const font: OgFontConfig = { name: 'Inter', weight: 400 };
    const detector = new GoogleFontDetector(font);

    // Detect Latin character 'a'
    const urls = await detector.detect('a');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://fonts.googleapis.com/css2'),
      expect.anything()
    );
    expect(urls).toContain('https://fonts.gstatic.com/latin.woff2');
    expect(urls).not.toContain('https://fonts.gstatic.com/chinese.woff2');
  });

  it('should detect correct font for Chinese character', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(mockCss),
    });

    const font: OgFontConfig = { name: 'Inter', weight: 400 };
    const detector = new GoogleFontDetector(font);

    // Detect Chinese character '世' (U+4E16)
    const urls = await detector.detect('世');

    expect(urls).toContain('https://fonts.gstatic.com/chinese.woff2');
    expect(urls).not.toContain('https://fonts.gstatic.com/latin.woff2');
  });

  it('should use fallback font if no range matches', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(mockCss),
    });

    const font: OgFontConfig = { name: 'Inter', weight: 400 };
    const detector = new GoogleFontDetector(font);

    // Character outside defined ranges should hit fallback
    const urls = await detector.detect('ع');

    expect(urls).toContain('https://fonts.gstatic.com/fallback.woff2');
  });

  it('should handle multiple characters requiring different fonts', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(mockCss),
    });

    const font: OgFontConfig = { name: 'Inter', weight: 400 };
    const detector = new GoogleFontDetector(font);

    // 'a' (Latin) + '世' (Chinese)
    const urls = await detector.detect('a世');

    expect(urls).toHaveLength(2);
    expect(urls).toContain('https://fonts.gstatic.com/latin.woff2');
    expect(urls).toContain('https://fonts.gstatic.com/chinese.woff2');
  });

  it('should construct correct API URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(''),
    });

    // Normal
    await new GoogleFontDetector({ name: 'Roboto', weight: 700 }).detect('a');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('family=Roboto:wght@700'),
      expect.anything()
    );

    // Italic
    await new GoogleFontDetector({
      name: 'Roboto',
      weight: 400,
      style: 'italic',
    }).detect('a');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('family=Roboto:ital,wght@1,400'),
      expect.anything()
    );

    // Space in name
    await new GoogleFontDetector({ name: 'Open Sans' }).detect('a');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('family=Open+Sans:wght@400'),
      expect.anything()
    );
  });
});
