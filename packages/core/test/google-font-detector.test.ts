import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleFontDetector } from '../src/utils/google-font-detector';

describe('GoogleFontDetector', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect subset and fallback URLs for mixed text', async () => {
    const css = `
      @font-face {
        font-family: 'Inter';
        src: url(https://fonts.gstatic.com/latin.woff2) format('woff2');
        unicode-range: U+0041-005A;
      }
      @font-face {
        font-family: 'Inter';
        src: url(https://fonts.gstatic.com/fallback.woff2) format('woff2');
      }
    `;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => css,
      })
    );

    const detector = new GoogleFontDetector({ name: 'Inter', weight: 400 });
    const urls = await detector.detect('A😀');

    expect(urls).toContain('https://fonts.gstatic.com/latin.woff2');
    expect(urls).toContain('https://fonts.gstatic.com/fallback.woff2');
  });

  it('should use the first matching @font-face rule in CSS order', async () => {
    const css = `
      @font-face {
        font-family: 'Inter';
        src: url(https://fonts.gstatic.com/latin.woff2) format('woff2');
        unicode-range: U+0041-005A;
      }
      @font-face {
        font-family: 'Inter';
        src: url(https://fonts.gstatic.com/fallback.woff2) format('woff2');
      }
    `;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => css,
      })
    );

    const detector = new GoogleFontDetector({ name: 'Inter', weight: 400 });
    const urls = await detector.detect('A');

    expect(urls).toEqual(['https://fonts.gstatic.com/latin.woff2']);
  });
});
