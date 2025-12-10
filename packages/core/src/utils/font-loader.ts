/**
 * Font loading utilities for OG image generation.
 *
 * This module provides functions to load fonts from various sources:
 * 1. Pre-loaded binary data (Buffer/ArrayBuffer)
 * 2. Remote URLs (custom font files)
 * 3. Google Fonts API (automatic detection and loading)
 */

import type { Font } from 'satori';

import type { OgFontConfig } from '../types';
import { GoogleFontDetector } from './google-font-detector';
import { loadFontFromUrl } from './font-fetcher';

/**
 * Loads multiple fonts in parallel and filters out any that failed to load.
 *
 * This is the main entry point for loading all fonts needed for OG image rendering.
 * It processes each font configuration and returns only successfully loaded fonts.
 *
 * @param fonts - Array of font configurations to load
 * @returns Promise resolving to an array of successfully loaded Font objects
 *
 * @example
 * const fonts = await loadFonts([
 *   { name: 'Inter', weight: 400 },
 *   { name: 'Roboto', weight: 700, style: 'italic' }
 * ]);
 */
export const loadFonts = async (fonts: OgFontConfig[]): Promise<Font[]> => {
  // Load all fonts in parallel for better performance
  const loadedFonts = await Promise.all(fonts.map((font) => loadFont(font)));

  // Filter out any fonts that failed to load (returned null)
  return loadedFonts.filter((font): font is Font => font !== null);
};

/**
 * Loads a single font from various sources based on the configuration.
 *
 * Loading priority:
 * 1. If `data` is provided → use the pre-loaded binary data
 * 2. If `url` is provided → fetch the font from the URL
 * 3. Otherwise → auto-detect and load from Google Fonts
 *
 * @param font - Font configuration specifying name, weight, style, and source
 * @returns Promise resolving to a Font object, or null if loading fails
 */
export const loadFont = async (font: OgFontConfig): Promise<Font | null> => {
  // Strategy 1: Load font from pre-loaded binary data
  // This is the fastest option as no network request is needed
  if (font.data) {
    return {
      name: font.name,
      data: font.data,
      style: font.style || 'normal',
      weight: font.weight || 400,
    };
  }

  // Strategy 2: Load font from a custom URL
  // Useful for self-hosted fonts or custom font providers
  if (font.url) {
    const buffer = await loadFontFromUrl(font.url);
    return {
      name: font.name,
      data: Buffer.from(buffer),
      style: font.style || 'normal',
      weight: font.weight || 400,
    };
  }

  // Strategy 3: Auto-detect and load from Google Fonts
  // Uses a sample character ('a') to detect the Latin character set
  // This is the fallback for fonts without explicit data or URL
  const detector = new GoogleFontDetector(font);
  const detectedFonts = await detector.detect('a');

  // If no fonts were detected, the font might not exist on Google Fonts
  if (detectedFonts.length === 0) {
    return null;
  }

  // Load the first detected font variant (usually the base Latin subset)
  return {
    name: font.name,
    data: await loadFontFromUrl(detectedFonts[0]),
    style: font.style || 'normal',
    weight: font.weight || 400,
  };
};
