/**
 * Network utility for fetching remote resources.
 *
 * This module provides simple HTTP fetching functionality for loading
 * font files and other binary assets from remote URLs.
 */

/**
 * Fetches a font file from a URL and returns it as an ArrayBuffer.
 *
 * This function is used to download font files from CDNs (like Google Fonts)
 * so they can be embedded in OG images during server-side rendering.
 *
 * @param url - The URL of the font file to download
 * @returns Promise resolving to the font data as an ArrayBuffer
 *
 * @throws Will throw if the network request fails or the URL is invalid
 *
 * @example
 * const fontData = await loadFontFromUrl('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2');
 */
export const loadFontFromUrl = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  return await response.arrayBuffer();
};
