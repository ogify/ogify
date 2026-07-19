/**
 * Network utility for fetching remote resources with caching.
 *
 * This module provides HTTP fetching functionality for loading font files
 * and other binary assets from remote URLs, with built-in caching to avoid
 * redundant network requests for the same resources.
 */

import { toUint8Array } from './binary';
import { CacheManager } from './cache-manager';

/**
 * In-memory cache for storing downloaded font data.
 *
 * Key: Font URL
 * Value: Font bytes as Uint8Array
 */
const cache = new CacheManager({
  type: 'memory',
});

/**
 * Fetches a font file from a URL and returns it as a Uint8Array, with caching.
 *
 * This function is used to download font files from CDNs (like Google Fonts)
 * so they can be embedded in OG images during server-side rendering.
 * @param url - The URL of the font file to download
 * @returns Promise resolving to the font data as a Uint8Array
 * @throws Will throw if the network request fails or the URL is invalid
 */
export const loadFontFromUrl = async (url: string): Promise<Uint8Array> => {
  const cachedFont = await cache.get(url);
  if (cachedFont) {
    return cachedFont;
  }

  const fontData = await fetch(url).then((response) => response.arrayBuffer());
  const bytes = toUint8Array(fontData);

  await cache.set(url, bytes);

  return bytes;
};
