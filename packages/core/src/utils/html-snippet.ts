import type { ReactNode } from 'react';
import { html } from 'satori-html';

const HTML_TAG_PATTERN = /<[a-z][\s\S]*?>/i;
const HTML_LIKE_PATTERN = /<[a-z]/i;

/** Default flex `gap` when neither gap nor fontSize is provided. */
const DEFAULT_WORD_GAP_PX = 10;

/** Ratio to approximate natural word spacing from font size (~8px @ 28px). */
const GAP_FONT_RATIO = 0.29;

const ALLOWED_TAGS = new Set(['span', 'b', 'strong', 'em', 'i', 'br']);

const FORBIDDEN_PATTERNS = [
  /<\/\s*(div|p|body|html)\b/i,
  /<(div|p|body|html)\b/i,
  /<(script|iframe|object|embed|link|style|img|a|form|input)\b/i,
  /\bon\w+\s*=/i,
];

const HTML_TAG_NAME_PATTERN = /<\/?([a-z][a-z0-9]*)\b/gi;

type VNodeLike = {
  type?: string;
  props?: {
    children?: ReactNode;
    tw?: string;
    class?: string;
  };
};

type WordSpanStyle = {
  tw?: string;
  class?: string;
};

type WordSpanNode = {
  type: 'span';
  props: {
    tw?: string;
    class?: string;
    children: string;
  };
};

export type HtmlSnippetOptions = {
  /** Flex main-axis alignment for the word container. */
  justify?: 'flex-start' | 'center' | 'flex-end';
  /** Flex gap between word items in px. Overrides fontSize-derived gap. */
  gap?: number;
  /** Font size in px; used to derive gap when gap is omitted. */
  fontSize?: number;
};

function isHtmlMode(value: string): boolean {
  return HTML_TAG_PATTERN.test(value) || HTML_LIKE_PATTERN.test(value);
}

function resolveWordGap(options?: HtmlSnippetOptions): number {
  if (options?.gap != null) {
    return options.gap;
  }

  if (options?.fontSize != null) {
    return Math.max(1, Math.round(options.fontSize * GAP_FONT_RATIO));
  }

  return DEFAULT_WORD_GAP_PX;
}

function stripHtmlTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/<[^>]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toPlainTextFallback(value: string): string {
  const plain = stripHtmlTags(value);
  return plain || value.replace(/<[^>]+>/g, '').replace(/<[^>]+/g, '').trim();
}

function warnPlainTextFallback(reason: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[htmlSnippet] ${reason}; falling back to plain text`);
  }
}

function validateHtmlFragment(value: string): { ok: true } | { ok: false; reason: string } {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(value)) {
      return { ok: false, reason: 'fragment contains disallowed HTML' };
    }
  }

  const tagNames = [...value.matchAll(HTML_TAG_NAME_PATTERN)].map((match) => match[1].toLowerCase());
  for (const tagName of tagNames) {
    if (!ALLOWED_TAGS.has(tagName)) {
      return { ok: false, reason: `tag <${tagName}> is not allowed` };
    }
  }

  return { ok: true };
}

function unwrapWrappedSnippet(tree: VNodeLike): ReactNode {
  const outerChildren = tree.props?.children;

  if (!Array.isArray(outerChildren) || outerChildren.length === 0) {
    return null;
  }

  const wrapper = outerChildren[0];
  if (
    wrapper &&
    typeof wrapper === 'object' &&
    'type' in wrapper &&
    wrapper.type === 'div' &&
    'props' in wrapper
  ) {
    return (wrapper as VNodeLike).props?.children ?? null;
  }

  return outerChildren;
}

function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function collectWordSpans(node: ReactNode, inherited: WordSpanStyle = {}): WordSpanNode[] {
  if (node == null || node === false) {
    return [];
  }

  if (typeof node === 'string') {
    return splitWords(node).map((word) => ({
      type: 'span',
      props: {
        ...(inherited.tw ? { tw: inherited.tw, class: inherited.class } : {}),
        children: word,
      },
    }));
  }

  if (typeof node === 'number') {
    return collectWordSpans(String(node), inherited);
  }

  if (Array.isArray(node)) {
    return node.flatMap((child) => collectWordSpans(child, inherited));
  }

  if (typeof node === 'object' && 'type' in node && 'props' in node) {
    const vnode = node as VNodeLike;
    const style: WordSpanStyle = {
      tw: vnode.props?.tw ?? inherited.tw,
      class: vnode.props?.class ?? inherited.class,
    };

    return collectWordSpans(vnode.props?.children ?? null, style);
  }

  return [];
}

function inlineWordContainer(
  words: WordSpanNode[],
  options?: HtmlSnippetOptions
): {
  type: 'div';
  props: {
    style: Record<string, string | number>;
    children: WordSpanNode[];
  };
} {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        justifyContent: options?.justify ?? 'flex-start',
        width: '100%',
        gap: resolveWordGap(options),
      },
      children: words,
    },
  };
}

/**
 * Parses a small HTML fragment into Satori-compatible React nodes.
 *
 * **Plain mode** — no HTML tags: returns the string unchanged.
 *
 * **HTML mode** — one or more tags: validates, parses with satori-html (`class` → `tw`),
 * then splits into per-word flex items with `flex-wrap` and `gap` (Satori inline workaround,
 * [vercel/satori#484](https://github.com/vercel/satori/issues/484)).
 *
 * @param value - Trusted HTML fragment from template authors.
 *   Allowed tags: `span`, `b`, `strong`, `em`, `i`, `br` (with `class` attributes).
 *   Not for arbitrary end-user-generated HTML.
 */
export function htmlSnippet(value: string, options?: HtmlSnippetOptions): ReactNode {
  if (!value || !isHtmlMode(value)) {
    return value;
  }

  const validation = validateHtmlFragment(value);
  if (!validation.ok) {
    warnPlainTextFallback(validation.reason);
    return toPlainTextFallback(value);
  }

  const tree = html(`<div>${value}</div>`) as VNodeLike;
  const children = unwrapWrappedSnippet(tree);

  if (children == null) {
    warnPlainTextFallback('parse produced no children');
    return toPlainTextFallback(value);
  }

  const words = collectWordSpans(children);
  if (words.length === 0) {
    warnPlainTextFallback('parse produced no words');
    return toPlainTextFallback(value);
  }

  return inlineWordContainer(words, options) as ReactNode;
}
