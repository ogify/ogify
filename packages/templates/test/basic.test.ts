import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import template from '../src/basic/index';

function extractText(node: ReactNode, texts: string[] = []): string[] {
  if (node == null || typeof node === 'boolean') {
    return texts;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    texts.push(String(node));
    return texts;
  }

  if (Array.isArray(node)) {
    node.forEach((child) => extractText(child, texts));
    return texts;
  }

  if (typeof node === 'object' && 'props' in node && node.props) {
    extractText((node.props as { children?: ReactNode }).children, texts);
  }

  return texts;
}

describe('basic template', () => {
  it('renders subtitle text instead of repeating title', async () => {
    const title = 'UNIQUE_TITLE_VALUE';
    const subtitle = 'UNIQUE_SUBTITLE_VALUE';

    const result = await template.renderer({
      params: {
        title,
        subtitle,
        layout: 'aligned',
      },
      width: 1200,
      height: 630,
    });

    const texts = extractText(result);

    expect(texts).toContain(title);
    expect(texts).toContain(subtitle);
    expect(texts.filter((text) => text === title)).toHaveLength(1);
    expect(texts.filter((text) => text === subtitle)).toHaveLength(1);
  });

  it('parses HTML subtitle fragments instead of showing raw tags', async () => {
    const result = await template.renderer({
      params: {
        title: 'Title',
        subtitle: '<span class="font-bold">Zero-config</span> dynamic text',
        layout: 'aligned',
      },
      width: 1200,
      height: 630,
    });

    const texts = extractText(result);

    expect(texts).toContain('Zero-config');
    expect(texts).toContain('dynamic');
    expect(texts).toContain('text');
    expect(texts.some((text) => text.includes('<span'))).toBe(false);
  });
});
