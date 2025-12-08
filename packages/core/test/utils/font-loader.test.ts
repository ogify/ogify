import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadFonts, loadFont } from '../../src/utils/font-loader';
import type { OgFontConfig } from '../../src/types';

// Mock dependencies
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

import { loadFontFromUrl } from '../../src/utils/fetcher';
import { GoogleFontDetector } from '../../src/utils/google-font-detector';

describe('Font Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadFont', () => {
    it('should load font from data buffer', async () => {
      const fontData = Buffer.from('font-data');
      const config: OgFontConfig = {
        name: 'MyFont',
        data: fontData,
      };

      const result = await loadFont(config);

      expect(result).toEqual({
        name: 'MyFont',
        data: fontData,
        style: 'normal',
        weight: 400,
      });
      expect(loadFontFromUrl).not.toHaveBeenCalled();
    });

    it('should load font from URL', async () => {
      const fontData = new ArrayBuffer(8);
      vi.mocked(loadFontFromUrl).mockResolvedValue(fontData);

      const config: OgFontConfig = {
        name: 'MyFont',
        url: 'https://example.com/font.woff',
      };

      const result = await loadFont(config);

      expect(loadFontFromUrl).toHaveBeenCalledWith('https://example.com/font.woff');
      expect(result).toEqual({
        name: 'MyFont',
        data: Buffer.from(fontData),
        style: 'normal',
        weight: 400,
      });
    });

    it('should load font from Google Fonts', async () => {
      const fontData = new ArrayBuffer(8);
      vi.mocked(loadFontFromUrl).mockResolvedValue(fontData);

      const mockDetect = vi.fn().mockResolvedValue(['https://fonts.gstatic.com/font.woff2']);
      vi.spyOn(GoogleFontDetector.prototype, 'detect').mockImplementation(mockDetect);

      const config: OgFontConfig = {
        name: 'Inter',
        weight: 700,
      };

      const result = await loadFont(config);

      expect(mockDetect).toHaveBeenCalledWith('a');
      expect(loadFontFromUrl).toHaveBeenCalledWith('https://fonts.gstatic.com/font.woff2');
      expect(result).toEqual({
        name: 'Inter',
        data: fontData,
        style: 'normal',
        weight: 700,
      });
    });

    it('should return null if Google Font not found', async () => {
      const mockDetect = vi.fn().mockResolvedValue([]);
      vi.spyOn(GoogleFontDetector.prototype, 'detect').mockImplementation(mockDetect);

      const config: OgFontConfig = {
        name: 'UnknownFont',
      };

      const result = await loadFont(config);

      expect(result).toBeNull();
    });
  });

  describe('loadFonts', () => {
    it('should load multiple fonts in parallel', async () => {
      const fontData = new ArrayBuffer(8);
      vi.mocked(loadFontFromUrl).mockResolvedValue(fontData);

      // Mock Google Font detection for the second font
      const mockDetect = vi.fn().mockResolvedValue(['https://fonts.gstatic.com/font.woff2']);
      vi.spyOn(GoogleFontDetector.prototype, 'detect').mockImplementation(mockDetect);

      const fonts: OgFontConfig[] = [
        { name: 'Custom', url: 'https://example.com/font.woff' },
        { name: 'Google', weight: 400 },
      ];

      const results = await loadFonts(fonts);

      expect(results).toHaveLength(2);
      expect(loadFontFromUrl).toHaveBeenCalledTimes(2);
    });

    it('should filter out failed fonts', async () => {
      // First font loads (data)
      const font1: OgFontConfig = {
        name: 'Font1',
        data: Buffer.from('data'),
      };

      // Second font fails (Google Font not found)
      const mockDetect = vi.fn().mockResolvedValue([]);
      vi.spyOn(GoogleFontDetector.prototype, 'detect').mockImplementation(mockDetect);

      const font2: OgFontConfig = {
        name: 'Font2',
      };

      const results = await loadFonts([font1, font2]);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Font1');
    });
  });
});
