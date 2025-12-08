import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadAdditionalAsset } from '../../src/utils/additional-asset-loader';
import { loadEmoji } from '../../src/utils/emoji-loader';
import { loadFontFromUrl } from '../../src/utils/fetcher';
import { GoogleFontDetector } from '../../src/utils/google-font-detector';

// Mock dependencies
vi.mock('../../src/utils/emoji-loader', () => ({
  loadEmoji: vi.fn(),
}));

vi.mock('../../src/utils/fetcher', () => ({
  loadFontFromUrl: vi.fn(),
}));

vi.mock('../../src/utils/google-font-detector', () => {
  return {
    GoogleFontDetector: class {
      detect() {
        return Promise.resolve([]);
      }
    },
  };
});

describe('loadAdditionalAsset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load emoji when code is "emoji"', async () => {
    vi.mocked(loadEmoji).mockResolvedValue('data:image/svg+xml;base64,emoji');

    const result = await loadAdditionalAsset({
      code: 'emoji',
      segment: '😀',
      fonts: [],
      emojiProvider: 'twemoji',
    });

    expect(loadEmoji).toHaveBeenCalledWith('twemoji', '😀');
    expect(result).toBe('data:image/svg+xml;base64,emoji');
  });

  it('should load fallback fonts when code is not "emoji"', async () => {
    const fontData = new ArrayBuffer(8);
    vi.mocked(loadFontFromUrl).mockResolvedValue(fontData);

    const mockDetect = vi.fn().mockResolvedValue(['https://fonts.gstatic.com/font.woff2']);
    vi.spyOn(GoogleFontDetector.prototype, 'detect').mockImplementation(mockDetect);

    const result = await loadAdditionalAsset({
      code: 'font',
      segment: '你好',
      fonts: [{ name: 'Inter', weight: 400 }],
      emojiProvider: 'twemoji',
    });

    // Should detect fonts
    expect(mockDetect).toHaveBeenCalledWith('你好');

    // Should download fonts
    expect(loadFontFromUrl).toHaveBeenCalledWith('https://fonts.gstatic.com/font.woff2');

    // Should return Satori font config
    expect(result).toEqual([
      {
        name: 'Inter-Fallback-0',
        data: fontData,
        style: 'normal',
        weight: 400,
      },
    ]);
  });

  it('should handle multiple fonts and multiple detected URLs', async () => {
    const fontData = new ArrayBuffer(8);
    vi.mocked(loadFontFromUrl).mockResolvedValue(fontData);

    const mockDetect = vi.fn().mockResolvedValue(['url1', 'url2']);
    vi.spyOn(GoogleFontDetector.prototype, 'detect').mockImplementation(mockDetect);

    const result = await loadAdditionalAsset({
      code: 'font',
      segment: 'text',
      fonts: [{ name: 'Font1' }, { name: 'Font2' }],
      emojiProvider: 'twemoji',
    });

    // 2 fonts * 2 URLs each = 4 downloads
    expect(loadFontFromUrl).toHaveBeenCalledTimes(4);
    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result).toHaveLength(4);
    }
  });
});
