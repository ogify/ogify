/**
 * Additional asset loader for dynamic OG image rendering.
 *
 * This module handles loading of assets that are discovered during the rendering process,
 * such as emojis and fallback fonts for characters not covered by the primary fonts.
 *
 * Satori (the OG image renderer) calls this loader when it encounters:
 * - Emoji characters that need to be rendered as SVG images
 * - Text characters that require additional font files (e.g., special Unicode ranges)
 */

import type { SatoriOptions } from 'satori';

import type { OgFontConfig, OgEmojiProvider } from '../types';
import { GoogleFontDetector } from './google-font-detector';
import { loadEmoji } from './emoji-loader';
import { loadFontFromUrl } from './fetcher';

/**
 * Options for loading additional assets during OG image rendering.
 */
interface LoadAdditionalAssetOptions {
  /**
   * Asset type identifier.
   * - 'emoji': Load an emoji SVG
   * - Other values: Load fallback fonts for the text segment
   */
  code: string;

  /**
   * The text segment that needs to be rendered.
   * For emojis: the emoji character itself
   * For fonts: the text that requires additional font files
   */
  segment: string;

  /**
   * Array of font configurations to check for fallback fonts.
   * Each font may have multiple variants (weights, styles, Unicode ranges)
   */
  fonts: OgFontConfig[];

  /**
   * The emoji provider to use when loading emoji assets.
   * Examples: 'twemoji', 'fluent', 'noto', 'openmoji'
   */
  emojiProvider: OgEmojiProvider;
}

/**
 * Loads additional assets (emojis or fallback fonts) required for rendering OG images.
 *
 * This function is called by Satori when it encounters characters that need special handling:
 *
 * **Emoji Loading (code === 'emoji'):**
 * - Fetches the emoji SVG from the specified provider (e.g., Twemoji, Fluent)
 * - Returns a base64-encoded data URI for embedding in the image
 *
 * **Fallback Font Loading (code !== 'emoji'):**
 * - Detects which Google Font files are needed to render the text segment
 * - Downloads the font files in parallel for optimal performance
 * - Returns an array of font configurations compatible with Satori
 *
 * @param options - Configuration object for asset loading
 * @returns Promise resolving to either:
 *   - Emoji data URI (string) when code is 'emoji'
 *   - Array of Satori font configurations when loading fallback fonts
 *
 * @example
 * // Loading an emoji
 * const emojiData = await loadAdditionalAsset({
 *   code: 'emoji',
 *   segment: '😀',
 *   fonts: [],
 *   emojiProvider: 'twemoji'
 * });
 *
 * @example
 * // Loading fallback fonts for special characters
 * const fallbackFonts = await loadAdditionalAsset({
 *   code: 'font',
 *   segment: '你好',
 *   fonts: [{ name: 'Inter', weight: 400 }],
 *   emojiProvider: 'twemoji'
 * });
 */
export const loadAdditionalAsset = async (
  options: LoadAdditionalAssetOptions
): Promise<string | SatoriOptions['fonts']> => {
  const { code, segment, fonts, emojiProvider } = options;

  // Option 1: Handle emoji loading
  // When Satori encounters an emoji character, it requests the emoji SVG
  if (code === 'emoji') {
    return await loadEmoji(emojiProvider, segment);
  }

  // Option 2: Handle fallback font loading
  // When Satori encounters text that requires additional fonts (e.g., CJK characters),
  // we need to detect and load the appropriate Google Font files

  // Initialize array to store all fallback font configurations
  const fallbackFonts: SatoriOptions['fonts'] = [];

  // Process each font configuration in parallel to find required font files
  await Promise.all(
    fonts.map(async (fontConfig) => {
      // Step 1: Detect which Google Font URLs are needed for this text segment
      // The detector analyzes the Unicode characters and matches them to font subsets
      const detector = new GoogleFontDetector(fontConfig);
      const detectedFontUrls = await detector.detect(segment);

      // Step 2: Download all detected font files in parallel
      // This is more efficient than downloading them sequentially
      const fontDataArray = await Promise.all(
        detectedFontUrls.map(async (fontUrl) => {
          return await loadFontFromUrl(fontUrl);
        })
      );

      // Step 3: Create Satori font configurations for each downloaded font
      // Each font gets a unique name with an index to avoid conflicts
      fontDataArray.forEach((fontData, index) => {
        fallbackFonts.push({
          // Generate unique name: e.g., "Inter-Fallback-0", "Inter-Fallback-1"
          name: `${fontConfig.name}-Fallback-${index}`,

          // The downloaded font binary data
          data: fontData,

          // Inherit style from the original font config (default: 'normal')
          style: fontConfig.style || 'normal',

          // Inherit weight from the original font config (default: 400)
          weight: fontConfig.weight || 400,
        });
      });
    })
  );

  // Return all loaded fallback fonts for Satori to use during rendering
  return fallbackFonts;
};
