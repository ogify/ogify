import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadFontFromUrl } from '../../src/utils/fetcher';

describe('loadFontFromUrl', () => {
  beforeEach(() => {
    // Clear fetch mocks before each test
    vi.clearAllMocks();
  });

  it('should fetch font data from URL', async () => {
    const mockArrayBuffer = new ArrayBuffer(8);
    const mockResponse = {
      arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const url = 'https://example.com/font.woff2';
    const result = await loadFontFromUrl(url);

    expect(global.fetch).toHaveBeenCalledWith(url);
    expect(result).toBe(mockArrayBuffer);
  });

  it('should cache font data and not refetch on subsequent calls', async () => {
    // Reset modules to clear cache
    vi.resetModules();

    const mockArrayBuffer = new ArrayBuffer(8);
    const mockResponse = {
      arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    // Re-import to get fresh module with cleared cache
    const { loadFontFromUrl: freshLoadFontFromUrl } = await import('../../src/utils/fetcher');

    const url = 'https://example.com/cached-font.woff2';

    // First call
    const result1 = await freshLoadFontFromUrl(url);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call - should use cache
    const result2 = await freshLoadFontFromUrl(url);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still only called once
    expect(result2).toBe(result1);
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Network error');
    global.fetch = vi.fn().mockRejectedValue(mockError);

    const url = 'https://example.com/invalid-font.woff2';

    await expect(loadFontFromUrl(url)).rejects.toThrow('Network error');
  });

  it('should handle different URLs independently', async () => {
    const mockArrayBuffer1 = new ArrayBuffer(8);
    const mockArrayBuffer2 = new ArrayBuffer(16);

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer1),
      })
      .mockResolvedValueOnce({
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer2),
      });

    const url1 = 'https://example.com/font1.woff2';
    const url2 = 'https://example.com/font2.woff2';

    const result1 = await loadFontFromUrl(url1);
    const result2 = await loadFontFromUrl(url2);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result1).toBe(mockArrayBuffer1);
    expect(result2).toBe(mockArrayBuffer2);
  });
});
