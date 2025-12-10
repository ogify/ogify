/**
 * Network utility for fetching remote resources with caching.
 *
 * This module provides HTTP fetching functionality for loading font files
 * and other binary assets from remote URLs, with built-in caching to avoid
 * redundant network requests for the same resources.
 */

import { CacheManager } from './cache-manager';

/**
 * In-memory cache for storing downloaded font data.
 *
 * Key: Font URL
 * Value: Promise resolving to the font ArrayBuffer
 */
const cache = new CacheManager({
  type: 'memory',
});

/**
 * Fetches a font file from a URL and returns it as an ArrayBuffer, with caching.
 *
 * This function is used to download font files from CDNs (like Google Fonts)
 * so they can be embedded in OG images during server-side rendering.
 * @param url - The URL of the font file to download
 * @returns Promise resolving to the font data as an ArrayBuffer
 * @throws Will throw if the network request fails or the URL is invalid
 */
export const loadFontFromUrl = async (url: string): Promise<Buffer> => {
  // Check if the font is already cached
  const cachedFont = await cache.get(url);
  if (cachedFont) {
    return cachedFont;
  }

  // Create a new promise for fetching the font
  const fontData = await fetch(url).then((response) => response.arrayBuffer());

  // Cache the promise before awaiting it
  await cache.set(url, Buffer.from(fontData));

  return Buffer.from(fontData);
};
