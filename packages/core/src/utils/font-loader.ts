import type { Font } from 'satori';

import type { FontConfig } from '../types';
import { GoogleFontDetector } from './google-font-detector';
import { loadFontFromUrl } from './fetcher';

export const loadFonts = async (fonts: FontConfig[]) => {
  return (await Promise.all(fonts.map((font) => loadFont(font)))).filter((font) => font !== null);
};

export const loadFont = async (font: FontConfig): Promise<Font | null> => {
  // Load font from data
  if (font.data) {
    return {
      name: font.name,
      data: font.data,
      style: font.style || 'normal',
      weight: font.weight || 400,
    };
  }

  // Load font from url
  if (font.url) {
    const buffer = await loadFontFromUrl(font.url);
    return {
      name: font.name,
      data: Buffer.from(buffer),
      style: font.style || 'normal',
      weight: font.weight || 400,
    };
  }

  // By default, load latin font
  const detector = new GoogleFontDetector(font);
  const detectedFonts = await detector.detect('a');

  if (detectedFonts.length === 0) {
    return null;
  }

  return {
    name: font.name,
    data: await loadFontFromUrl(detectedFonts[0]),
    style: font.style || 'normal',
    weight: font.weight || 400,
  };
};
