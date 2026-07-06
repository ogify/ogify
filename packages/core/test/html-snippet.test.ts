import { describe, expect, it } from 'vitest';

import { htmlSnippet } from '../src/utils/html-snippet';

describe('htmlSnippet', () => {
  it('returns plain text unchanged (plain mode)', () => {
    expect(htmlSnippet('Hello world')).toBe('Hello world');
    expect(htmlSnippet('3 < 5')).toBe('3 < 5');
    expect(htmlSnippet('')).toBe('');
  });

  it('parses HTML into a word-split flex container (html mode)', () => {
    const result = htmlSnippet('<span class="font-bold">Zero-config</span> dynamic text');

    expect(result).toMatchObject({
      type: 'div',
      props: {
        style: expect.objectContaining({
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        }),
      },
    });

    const words = (result as { props: { children: Array<{ props: Record<string, unknown> }> } })
      .props.children;

    expect(words[0]).toMatchObject({
      type: 'span',
      props: {
        class: 'font-bold',
        tw: 'font-bold',
        children: 'Zero-config',
      },
    });
    expect(words[1]).toMatchObject({
      type: 'span',
      props: { children: 'dynamic' },
    });
    expect(words[2]).toMatchObject({
      type: 'span',
      props: { children: 'text' },
    });
  });

  it('uses html mode for any fragment with at least one tag', () => {
    const result = htmlSnippet('<span class="font-bold">Hello</span> <span class="opacity-60">world</span>');

    expect(result).toMatchObject({
      props: {
        style: expect.objectContaining({ gap: 10 }),
      },
    });

    const words = (result as { props: { children: Array<{ props: Record<string, unknown> }> } })
      .props.children;

    expect(words).toHaveLength(2);
    expect(words[0]).toMatchObject({
      props: { tw: 'font-bold', children: 'Hello' },
    });
    expect(words[1]).toMatchObject({
      props: { tw: 'opacity-60', children: 'world' },
    });
  });

  it('applies justify alignment to the container', () => {
    const result = htmlSnippet('<b>Hello</b> world', { justify: 'center' });

    expect(result).toMatchObject({
      props: {
        style: expect.objectContaining({ justifyContent: 'center' }),
      },
    });
  });

  it('uses explicit gap when provided', () => {
    const result = htmlSnippet('<b>Hello</b> world', { gap: 6 });

    expect(result).toMatchObject({
      props: {
        style: expect.objectContaining({ gap: 6 }),
      },
    });
  });

  it('derives gap from fontSize', () => {
    const result = htmlSnippet('<b>Hello</b> world', { fontSize: 28 });

    expect(result).toMatchObject({
      props: {
        style: expect.objectContaining({ gap: 8 }),
      },
    });
  });

  it('prefers explicit gap over fontSize', () => {
    const result = htmlSnippet('<b>Hello</b> world', { fontSize: 28, gap: 12 });

    expect(result).toMatchObject({
      props: {
        style: expect.objectContaining({ gap: 12 }),
      },
    });
  });

  it('falls back to plain text for disallowed tags without raw HTML', () => {
    const result = htmlSnippet('<script>alert(1)</script>safe text');

    expect(typeof result).toBe('string');
    expect(result).toBe('alert(1) safe text');
    expect(String(result)).not.toMatch(/<script/i);
  });

  it('falls back to plain text for wrapper-breaking fragments', () => {
    const result = htmlSnippet('</div><span class="font-bold">x</span>');

    expect(typeof result).toBe('string');
    expect(result).toBe('x');
    expect(String(result)).not.toMatch(/<span/i);
  });

  it('falls back to plain text for anchor tags', () => {
    const result = htmlSnippet('<a href="https://example.com">link</a>');

    expect(result).toBe('link');
    expect(String(result)).not.toMatch(/<a\b/i);
  });

  it('falls back to plain text for nested block elements', () => {
    const result = htmlSnippet('<div>blocked</div>');

    expect(result).toBe('blocked');
    expect(String(result)).not.toMatch(/<div/i);
  });

  it('falls back to plain text when only empty tags remain', () => {
    const result = htmlSnippet('<div></div>');

    expect(result).toBe('');
  });

  it('does not return raw tags for malformed fragments', () => {
    const result = htmlSnippet('<span broken');

    expect(typeof result).toBe('string');
    expect(String(result)).not.toMatch(/<span/i);
    expect(result).toBe('');
  });
});
