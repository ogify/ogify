/**
 * Google Fonts detection and URL extraction utility.
 *
 * This module provides functionality to:
 * 1. Query the Google Fonts API for font CSS
 * 2. Parse the CSS to extract font file URLs
 * 3. Match font URLs to specific Unicode ranges
 * 4. Detect which font files are needed for rendering specific text
 *
 * Inspired by https://github.com/vercel/satori/blob/main/playground/utils/font.ts
 */

import { FontConfig } from '../types';

/**
 * User-Agent strings for different font formats.
 *
 * Google Fonts returns different font formats based on the User-Agent:
 * - Old browsers (Firefox 2) → TTF (TrueType Font)
 * - Modern browsers (Firefox 27+) → WOFF (Web Open Font Format)
 */
const USER_AGENTS = {
  ttf: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.20) Gecko/20081217 Firefox/2.0.0.20',
  woff: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
};

/**
 * Represents a Unicode range as either:
 * - A single code point (number)
 * - A range of code points ([start, end])
 *
 * @example
 * [65, [97, 122], 8364] // Represents: 'A', 'a-z', '€'
 */
type UnicodeRange = Array<number | number[]>;

/**
 * Utility functions for Unicode range parsing and character matching.
 */
const utils = {
  /**
   * Converts a CSS unicode-range string to an array of code points and ranges.
   *
   * @param input - CSS unicode-range value (e.g., "U+0041, U+0061-007A")
   * @returns Array of code points and ranges
   *
   * @example
   * toUnicodeRange("U+0041, U+0061-007A, U+20AC")
   * // Returns: [65, [97, 122], 8364]
   * // Represents: 'A', 'a-z', '€'
   */
  toUnicodeRange: (input: string): UnicodeRange => {
    return input.split(', ').map((range) => {
      // Remove the 'U+' prefix
      range = range.replaceAll('U+', '');

      // Parse hex values to decimal code points
      const [start, end] = range.split('-').map((hex) => parseInt(hex, 16));

      // If there's no end value, it's a single code point
      if (isNaN(end)) {
        return start;
      }

      // Otherwise, it's a range [start, end]
      return [start, end];
    });
  },

  /**
   * Checks if a character's code point falls within a Unicode range.
   *
   * @param segment - The character to check
   * @param range - Array of code points and ranges to check against
   * @returns true if the character is in the range, false otherwise
   *
   * @example
   * checkSegmentInRange('A', [65, [97, 122]]) // true (65 is in the range)
   * checkSegmentInRange('a', [65, [97, 122]]) // true (97 is in [97, 122])
   * checkSegmentInRange('€', [65, [97, 122]]) // false (8364 is not in the range)
   */
  checkSegmentInRange: (segment: string, range: UnicodeRange): boolean => {
    // Empty range means no restrictions (matches all characters)
    if (range.length === 0) {
      return false;
    }

    // Get the Unicode code point of the first character
    const codePoint = segment.codePointAt(0);

    if (!codePoint) return false;

    // Check if the code point matches any value or range
    return range.some((val) => {
      if (typeof val === 'number') {
        // Single code point match
        return codePoint === val;
      } else {
        // Range match [start, end]
        const [start, end] = val;
        return start <= codePoint && codePoint <= end;
      }
    });
  },
};

/**
 * Detects and extracts Google Font URLs needed to render specific text.
 *
 * Google Fonts splits fonts into multiple files based on Unicode ranges
 * (e.g., Latin, Cyrillic, Greek, etc.) to optimize loading. This class:
 * 1. Fetches the font CSS from Google Fonts API
 * 2. Parses @font-face rules to extract URLs and unicode-range values
 * 3. Matches characters in the text to their corresponding font URLs
 *
 * @example
 * const detector = new GoogleFontDetector({
 *   name: 'Inter',
 *   weight: 400,
 *   style: 'normal'
 * });
 *
 * const urls = await detector.detect('Hello 世界');
 * // Returns URLs for both Latin and CJK (Chinese) font subsets
 */
export class GoogleFontDetector {
  /**
   * Maps font URLs to their Unicode ranges.
   * Key: Font file URL
   * Value: Array of Unicode code points/ranges that the font supports
   */
  private rangesByUrl: {
    [url: string]: UnicodeRange;
  } = {};

  /** The font configuration to detect */
  private font: FontConfig;

  constructor(font: FontConfig) {
    this.font = font;
  }

  /**
   * Detects which Google Font URLs are needed to render the given text.
   *
   * This method:
   * 1. Loads the font CSS from Google Fonts (if not already loaded)
   * 2. Splits the text into individual characters
   * 3. Finds the font URL for each character based on Unicode ranges
   * 4. Returns unique URLs (no duplicates)
   *
   * @param text - The text to analyze
   * @returns Promise resolving to an array of unique font file URLs
   *
   * @example
   * const urls = await detector.detect('Hello 世界');
   * // Returns: [
   * //   'https://fonts.gstatic.com/.../latin.woff2',
   * //   'https://fonts.gstatic.com/.../chinese.woff2'
   * // ]
   */
  public async detect(text: string): Promise<string[]> {
    // Load font metadata from Google Fonts API
    await this.load();

    // Detect the font URL for each character
    const detectedUrls = text
      .split('')
      .map((segment) => {
        return this.detectSegment(segment);
      })
      .filter((url): url is string => url !== null);

    // Remove duplicates using Set
    const uniqueUrls = [...new Set(detectedUrls)];
    return uniqueUrls;
  }

  /**
   * Finds the font URL that supports rendering a specific character.
   *
   * @param segment - A single character to check
   * @returns The font URL that supports this character, or null if not found
   */
  private detectSegment(segment: string): string | null {
    for (const url of Object.keys(this.rangesByUrl)) {
      const range = this.rangesByUrl[url];

      // Empty range means this font file supports all characters (fallback)
      // Or check if the character is in the Unicode range
      if (range.length === 0 || utils.checkSegmentInRange(segment, range)) {
        return url;
      }
    }

    return null;
  }

  /**
   * Fetches and parses the Google Fonts CSS to extract font URLs and Unicode ranges.
   *
   * This method:
   * 1. Constructs the Google Fonts API URL with the font family, weight, and style
   * 2. Fetches the CSS with an appropriate User-Agent to get the desired format
   * 3. Parses each @font-face rule to extract URLs and unicode-range values
   * 4. Stores the mapping in `rangesByUrl` for later character matching
   */
  private async load(): Promise<void> {
    const { name, style, weight, format = 'woff' } = this.font;

    // Construct the Google Fonts API URL
    // Example: https://fonts.googleapis.com/css2?family=Inter:wght@400
    // Example with italic: https://fonts.googleapis.com/css2?family=Inter:ital,wght@1,400
    const apiUrl = `https://fonts.googleapis.com/css2?display=swap&family=${name.split(' ').join('+')}:${style === 'italic' ? 'ital,' : ''}wght@${style === 'italic' ? '1,' : ''}${weight || 400}`;

    // Fetch the CSS with the appropriate User-Agent
    const content = await (
      await fetch(apiUrl, {
        headers: {
          'User-Agent': format === 'ttf' ? USER_AGENTS.ttf : USER_AGENTS.woff,
        },
      })
    ).text();

    // Parse each @font-face rule to extract URL and Unicode range
    content.split('@font-face').forEach((fontFace) => {
      this.extractUrlAndRange(fontFace);
    });
  }

  /**
   * Extracts the font URL and Unicode range from a @font-face CSS rule.
   *
   * @param input - A @font-face CSS rule as a string
   *
   * @example
   * Input:
   * ```
   * {
   *   font-family: 'Inter';
   *   src: url(https://fonts.gstatic.com/.../inter.woff2) format('woff2');
   *   unicode-range: U+0041-005A, U+0061-007A;
   * }
   * ```
   *
   * Stores: rangesByUrl['https://fonts.gstatic.com/.../inter.woff2'] = [[65, 90], [97, 122]]
   */
  private extractUrlAndRange(input: string) {
    // Only process valid @font-face rules with url() and format()
    if (input && input.includes('url') && input.includes('format')) {
      // Extract the font file URL
      const [, url] = input.match(/url\((.*?)\)/) || [];

      // Extract the font format (woff, woff2, truetype, etc.)
      const [, format] = input.match(/format\(['"](.+?)['"]\)/) || [];

      // Extract the Unicode range (optional)
      const [, unicodeRange] = input.match(/unicode-range:\s*(.*?);/) || [];

      // Warn about unsupported formats
      if (!['woff', 'woff2', 'truetype'].includes(format)) {
        console.warn(`[Warning] Unsupported font format: ${format}`);
      }

      // Store the URL and its Unicode range
      if (url) {
        if (unicodeRange) {
          // Parse the unicode-range CSS value into code points
          this.rangesByUrl[url] = [...utils.toUnicodeRange(unicodeRange)];
        } else {
          // Empty range means this font supports all characters (fallback)
          this.rangesByUrl[url] = [];
        }
      }
    }
  }
}
