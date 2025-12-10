/**
 * Emoji loader utility for converting emoji characters to SVG data URIs.
 *
 * This module provides functionality to:
 * 1. Convert emoji characters to their Unicode code points
 * 2. Fetch emoji SVG files from various CDN providers
 * 3. Cache emoji data to avoid redundant network requests
 *
 * Modified version of https://unpkg.com/twemoji@13.1.0/dist/twemoji.esm.js
 * Inspired by https://github.com/vercel/satori/blob/main/playground/utils/twemoji.ts
 */

/*! Copyright Twitter Inc. and other contributors. Licensed under MIT */

import { OgEmojiProvider } from '../types';
import { CacheManager } from './cache-manager';

// Unicode constants for emoji processing
const ZERO_WIDTH_JOINER = String.fromCharCode(8205); // U+200D - joins multiple emojis
const VARIATION_SELECTOR_REGEX = /\uFE0F/g; // U+FE0F - emoji presentation selector

/**
 * Converts an emoji character to its Unicode code point representation.
 *
 * This function handles:
 * - Simple emojis (single code point)
 * - Complex emojis with variation selectors (e.g., ❤️)
 * - Compound emojis with zero-width joiners (e.g., 👨‍👩‍👧‍👦)
 *
 * @param char - The emoji character to convert
 * @returns Hyphen-separated hexadecimal code point(s) (e.g., "1f600" or "1f468-200d-1f469")
 *
 * @example
 * getIconCode('😀') // Returns: "1f600"
 * getIconCode('👨‍👩‍👧') // Returns: "1f468-200d-1f469-200d-1f467"
 */
export function getIconCode(char: string): string {
  // If the emoji contains a zero-width joiner, keep it as-is
  // Otherwise, remove variation selectors for simpler lookup
  const normalizedChar =
    char.indexOf(ZERO_WIDTH_JOINER) < 0 ? char.replace(VARIATION_SELECTOR_REGEX, '') : char;

  return toCodePoint(normalizedChar);
}

/**
 * Converts a Unicode string to hyphen-separated hexadecimal code points.
 *
 * This function handles Unicode surrogate pairs (used for emojis outside the Basic Multilingual Plane).
 * Surrogate pairs use two 16-bit code units to represent a single character:
 * - High surrogate: 0xD800 - 0xDBFF (55296 - 56319)
 * - Low surrogate: 0xDC00 - 0xDFFF (56320 - 57343)
 *
 * @param unicodeSurrogates - The Unicode string to convert
 * @returns Hyphen-separated hexadecimal code points
 */
function toCodePoint(unicodeSurrogates: string): string {
  const codePoints: string[] = [];
  let currentChar = 0;
  let highSurrogate = 0;
  let index = 0;

  while (index < unicodeSurrogates.length) {
    currentChar = unicodeSurrogates.charCodeAt(index++);

    if (highSurrogate) {
      // We have a high surrogate from the previous iteration
      // Combine it with the current low surrogate to get the full code point
      // Formula: (highSurrogate - 0xD800) * 0x400 + (lowSurrogate - 0xDC00) + 0x10000
      const codePoint = 65536 + ((highSurrogate - 55296) << 10) + (currentChar - 56320);
      codePoints.push(codePoint.toString(16));
      highSurrogate = 0;
    } else if (currentChar >= 55296 && currentChar <= 56319) {
      // This is a high surrogate, save it for the next iteration
      highSurrogate = currentChar;
    } else {
      // This is a regular character, convert directly to hex
      codePoints.push(currentChar.toString(16));
    }
  }

  return codePoints.join('-');
}

/**
 * CDN API endpoints for different emoji providers.
 *
 * Each provider offers different emoji styles:
 * - twemoji: Twitter's emoji set (colorful, rounded)
 * - openmoji: Open-source emoji with outlined style
 * - blobmoji: Google's blob-style emoji (deprecated but still available)
 * - noto: Google's Noto Color Emoji (current standard)
 * - fluent: Microsoft's Fluent emoji (3D style with color)
 * - fluentFlat: Microsoft's Fluent emoji (flat 2D style)
 */
export const apis: Record<OgEmojiProvider, string | ((code: string) => string)> = {
  twemoji: (code: string) =>
    `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${code.toLowerCase()}.svg`,

  openmoji: 'https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/',

  blobmoji: 'https://cdn.jsdelivr.net/npm/@svgmoji/blob@2.0.0/svg/',

  noto: 'https://cdn.jsdelivr.net/gh/svgmoji/svgmoji/packages/svgmoji__noto/svg/',

  fluent: (code: string) =>
    `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${code.toLowerCase()}_color.svg`,

  fluentFlat: (code: string) =>
    `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${code.toLowerCase()}_flat.svg`,
};

/**
 * Cache for storing emoji data URIs to avoid redundant network requests.
 * Key format: "{provider}:{codePoint}" (e.g., "twemoji:1f600")
 */
const cache = new CacheManager({
  type: 'memory',
});

/**
 * Loads an emoji SVG from a CDN provider and converts it to a base64 data URI.
 *
 * This function:
 * 1. Converts the emoji text to its Unicode code point
 * 2. Checks the cache for previously loaded emojis
 * 3. Fetches the SVG from the appropriate CDN
 * 4. Converts the SVG to a base64 data URI for embedding
 *
 * @param type - The emoji provider to use (defaults to 'noto' if invalid)
 * @param text - The emoji character to load
 * @returns Promise resolving to a base64-encoded SVG data URI
 *
 * @example
 * const emojiData = await loadEmoji('twemoji', '😀');
 * // Returns: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0i..."
 */
export async function loadEmoji(type: OgEmojiProvider, text: string): Promise<string> {
  // Convert emoji character to its code point representation
  const code = getIconCode(text);

  // Create a unique cache key combining provider and code point
  const cacheKey = `${type}:${code}`;

  // Return cached result if available
  const cached = await cache.get(cacheKey);
  if (cached) {
    return cached.toString();
  }

  // Fallback to 'noto' if provider is invalid or not specified
  if (!type || !apis[type]) {
    type = 'noto';
  }

  // Get the API endpoint (either a function or a base URL string)
  const api = apis[type];

  // Construct the full URL based on the API type
  const baseUrl = typeof api === 'function' ? api(code) : api;
  const fullUrl =
    typeof api === 'function'
      ? baseUrl // Function APIs return the complete URL
      : `${baseUrl}${code.toUpperCase()}.svg`; // String APIs need the filename appended

  // Fetch the SVG content and convert to base64 data URI
  const emojiPromise = fetch(fullUrl)
    .then((response) => response.text())
    .then((svgContent) => `data:image/svg+xml;base64,${btoa(svgContent)}`);

  // Cache the promise to prevent duplicate requests
  await cache.set(cacheKey, Buffer.from(await emojiPromise));

  return emojiPromise;
}
