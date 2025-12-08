/**
 * Network utility for fetching remote resources with caching.
 *
 * This module provides HTTP fetching functionality for loading font files
 * and other binary assets from remote URLs, with built-in caching to avoid
 * redundant network requests for the same resources.
 */

/**
 * In-memory cache for storing downloaded font data.
 *
 * Key: Font URL
 * Value: Promise resolving to the font ArrayBuffer
 *
 * Using Promise as the cache value ensures that:
 * 1. Multiple simultaneous requests for the same URL share a single network request
 * 2. Subsequent requests can reuse the cached result
 * 3. Failed requests don't get cached (the promise rejects)
 */
const cache: Record<string, Promise<ArrayBuffer>> = {};

/**
 * Fetches a font file from a URL and returns it as an ArrayBuffer, with caching.
 *
 * This function is used to download font files from CDNs (like Google Fonts)
 * so they can be embedded in OG images during server-side rendering.
 * @param url - The URL of the font file to download
 * @returns Promise resolving to the font data as an ArrayBuffer
 *
 * @throws Will throw if the network request fails or the URL is invalid
 *
 * @example
 * // First call - downloads from network
 * const fontData1 = await loadFontFromUrl('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2');
 *
 * // Second call - returns cached data (no network request)
 * const fontData2 = await loadFontFromUrl('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2');
 */
export const loadFontFromUrl = async (url: string): Promise<ArrayBuffer> => {
  // Check if the font is already cached
  if (url in cache) {
    return cache[url];
  }

  // Create a new promise for fetching the font
  const fontData = fetch(url).then((response) => response.arrayBuffer());

  // Cache the promise before awaiting it
  cache[url] = fontData;

  return fontData;
};
