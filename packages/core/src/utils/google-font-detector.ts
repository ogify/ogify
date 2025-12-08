// Inspired by https://github.com/vercel/satori/blob/main/playground/utils/font.ts

import { FontConfig } from '../types';

const USER_AGENTS = {
  ttf: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.20) Gecko/20081217 Firefox/2.0.0.20',
  woff: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
};

type UnicodeRange = Array<number | number[]>;

const utils = {
  toUnicodeRange: (input: string): UnicodeRange => {
    return input.split(', ').map((range) => {
      range = range.replaceAll('U+', '');
      const [start, end] = range.split('-').map((hex) => parseInt(hex, 16));

      if (isNaN(end)) {
        return start;
      }

      return [start, end];
    });
  },

  checkSegmentInRange: (segment: string, range: UnicodeRange): boolean => {
    if (range.length === 0) {
      return false;
    }

    const codePoint = segment.codePointAt(0);

    if (!codePoint) return false;

    return range.some((val) => {
      if (typeof val === 'number') {
        return codePoint === val;
      } else {
        const [start, end] = val;
        return start <= codePoint && codePoint <= end;
      }
    });
  },
};

export class GoogleFontDetector {
  private rangesByUrl: {
    [url: string]: UnicodeRange;
  } = {};

  private font: FontConfig;

  constructor(font: FontConfig) {
    this.font = font;
  }

  public async detect(text: string): Promise<string[]> {
    await this.load();

    const detectedUrls = text
      .split('')
      .map((segment) => {
        return this.detectSegment(segment);
      })
      .filter((url) => url !== null);

    const uniqueUrls = [...new Set(detectedUrls)];
    return uniqueUrls;
  }

  private detectSegment(segment: string): string | null {
    for (const url of Object.keys(this.rangesByUrl)) {
      const range = this.rangesByUrl[url];
      if (range.length === 0 || utils.checkSegmentInRange(segment, range)) {
        return url;
      }
    }

    return null;
  }

  private async load(): Promise<void> {
    const { name, style, weight, format = 'woff' } = this.font;
    const apiUrl = `https://fonts.googleapis.com/css2?display=swap&family=${name.split(' ').join('+')}:${style === 'italic' ? 'ital,' : ''}wght@${weight || 400}`;

    const content = await (
      await fetch(apiUrl, {
        headers: {
          'User-Agent': format === 'ttf' ? USER_AGENTS.ttf : USER_AGENTS.woff,
        },
      })
    ).text();

    content.split('@font-face').forEach((fontFace) => {
      this.extractUrlAndRange(fontFace);
    });
  }

  private extractUrlAndRange(input: string) {
    if (input && input.includes('url') && input.includes('format')) {
      const [, url] = input.match(/url\((.*?)\)/) || [];
      const [, format] = input.match(/format\(['"](.+?)['"]\)/) || [];
      const [, unicodeRange] = input.match(/unicode-range:\s*(.*?);/) || [];

      if (!['woff', 'truetype'].includes(format)) {
        console.warn(`[Waring] Unsupported font format: ${format}`);
      }

      if (url) {
        if (unicodeRange) {
          this.rangesByUrl[url] = [...utils.toUnicodeRange(unicodeRange)];
        } else {
          this.rangesByUrl[url] = [];
        }
      }
    }
  }
}
