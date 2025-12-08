// Import Satori types for font configuration
import type { SatoriOptions } from 'satori';

// Import custom types for font and emoji configuration
import type { FontConfig, EmojiProvider } from '../types';
import { GoogleFontDetector } from './google-font-detector';
import { loadEmoji } from './emoji-loader';
import { loadFontFromUrl } from './fetcher';

/**
 * Loads additional assets (emojis or fallback fonts) required for rendering OG images.
 *
 * This function handles two types of assets:
 * 1. Emojis: When code is 'emoji', it loads the appropriate emoji from the specified provider
 * 2. Fallback fonts: For other codes, it detects and loads Google Fonts needed to render the text segment
 *
 * @param options - Configuration object containing:
 *   - code: Asset type identifier ('emoji' or other font-related codes)
 *   - segment: The text segment to analyze for required fonts/emojis
 *   - fonts: Array of font configurations to check against
 *   - emojiProvider: The emoji provider to use (e.g., 'twemoji', 'fluent', 'noto')
 *
 * @returns Promise resolving to either:
 *   - Emoji data (when code is 'emoji')
 *   - Array of fallback font configurations compatible with Satori
 */
export const loadAdditionalAsset = async (options: {
  code: string;
  segment: string;
  fonts: FontConfig[];
  emojiProvider: EmojiProvider;
}) => {
  const { code, segment, fonts, emojiProvider } = options;

  // Handle emoji loading separately
  if (code === 'emoji') {
    return await loadEmoji(emojiProvider, segment);
  }

  // Initialize array to store fallback fonts for Satori rendering
  const fallbackFonts: SatoriOptions['fonts'] = [];

  // Process all fonts in parallel to detect which ones are needed for the text segment
  await Promise.all(
    fonts.map(async (font) => {
      const detector = new GoogleFontDetector(font);
      const fonts = await detector.detect(segment);

      const fontsData = await Promise.all(
        fonts.map(async (font) => {
          return await loadFontFromUrl(font);
        })
      );

      fontsData.forEach((fontData, index) => {
        fallbackFonts.push({
          name: `${font.name}-Fallback-${index}`,
          data: fontData,
          style: font.style || 'normal',
          weight: font.weight || 400,
        });
      });
    })
  );

  // Return all loaded fallback fonts for Satori to use during rendering
  return fallbackFonts;
};
