import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadFontFromUrl } from '../src/utils/font-fetcher';

describe('loadFontFromUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch font data and return a buffer', async () => {
    const url = 'https://fonts.gstatic.com/s/inter/v13/font-fetch.woff2';
    const data = Uint8Array.from([1, 2, 3]).buffer;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => data,
      })
    );

    const buffer = await loadFontFromUrl(url);

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.equals(Buffer.from(data))).toBe(true);
  });

  it('should return cached font on subsequent requests', async () => {
    const url = 'https://fonts.gstatic.com/s/inter/v13/font-cache.woff2';
    const data = Uint8Array.from([4, 5, 6]).buffer;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => data,
    });

    vi.stubGlobal('fetch', fetchMock);

    const first = await loadFontFromUrl(url);
    const second = await loadFontFromUrl(url);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second.equals(first)).toBe(true);
  });
});
