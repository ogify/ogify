import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadEmoji, getIconCode, apis } from '../../src/utils/emoji-loader';

describe('Emoji Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('getIconCode', () => {
    it('should convert simple emoji to code point', () => {
      expect(getIconCode('😀')).toBe('1f600');
    });

    it('should convert complex emoji with joiners', () => {
      // 👨‍👩‍👧‍👦: Man, Woman, Girl, Boy joined by ZWJ
      const family = '👨‍👩‍👧‍👦';
      const code = getIconCode(family);
      expect(code).toContain('200d');
      expect(code.split('-').length).toBeGreaterThan(1);
    });

    it('should remove variation selectors', () => {
      // ❤️ contains variation selector FE0F
      const heart = '❤️';
      expect(getIconCode(heart)).toBe('2764');
    });
  });

  describe('loadEmoji', () => {
    it('should fetch emoji SVG and convert to base64', async () => {
      const mockSvg = '<svg>emoji</svg>';
      global.fetch = vi.fn().mockResolvedValue({
        text: vi.fn().mockResolvedValue(mockSvg),
      });

      // Mock btoa since it might not be available in all test envs or behave differently
      global.btoa = vi.fn().mockReturnValue('base64-content');

      const { loadEmoji } = await import('../../src/utils/emoji-loader');
      const result = await loadEmoji('twemoji', '😀');

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe('data:image/svg+xml;base64,base64-content');
    });

    it('should use correct URL for different providers', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        text: vi.fn().mockResolvedValue('<svg></svg>'),
      });
      global.btoa = vi.fn().mockReturnValue('');

      const { loadEmoji } = await import('../../src/utils/emoji-loader');

      // Twemoji
      await loadEmoji('twemoji', '😀');
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('twemoji'));

      // Fluent
      await loadEmoji('fluent', '😀');
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('fluentui-emoji-unicode'));
    });

    it('should cache requests', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        text: vi.fn().mockResolvedValue('<svg></svg>'),
      });
      global.btoa = vi.fn().mockReturnValue('');

      const { loadEmoji } = await import('../../src/utils/emoji-loader');

      // First call
      await loadEmoji('twemoji', '😀');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call
      await loadEmoji('twemoji', '😀');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should fallback to noto if provider is invalid', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        text: vi.fn().mockResolvedValue('<svg></svg>'),
      });
      global.btoa = vi.fn().mockReturnValue('');

      const { loadEmoji, apis } = await import('../../src/utils/emoji-loader');

      await loadEmoji('invalid' as any, '😀');

      // Should use Noto URL
      const notoUrl = apis.noto as string;
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(notoUrl));
    });
  });
});
