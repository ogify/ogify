import type { ReactNode } from 'react';

/**
 * Type definitions for the OGify core library.
 *
 * This module provides TypeScript types and interfaces for:
 * - Font configuration and loading
 * - Template definition and parameters
 * - Template handler configuration
 * - Emoji providers
 * - Cross-platform Resvg backends
 */

import type { FontStyle, FontWeight } from 'satori';
import type { OgResvgBackend } from './backends/types';

export type { OgResvgBackend, OgResvgFitTo, OgResvgRenderOptions } from './backends/types';

/**
 * Supported emoji providers for rendering emoji characters in OG images.
 *
 * Each provider offers a different visual style:
 * - `twemoji`: Twitter's emoji set (colorful, rounded)
 * - `fluent`: Microsoft's Fluent emoji (3D style with color)
 * - `fluentFlat`: Microsoft's Fluent emoji (flat 2D style)
 * - `noto`: Google's Noto Color Emoji (current standard)
 * - `blobmoji`: Google's blob-style emoji (deprecated but still available)
 * - `openmoji`: Open-source emoji with outlined style
 */
export type OgEmojiProvider =
  | 'twemoji'
  | 'fluent'
  | 'fluentFlat'
  | 'noto'
  | 'blobmoji'
  | 'openmoji';

/**
 * Cache configuration for fonts, icons, and rendered images.
 *
 * Supports two caching strategies:
 * - Memory: Fast in-memory LRU cache (Node, Cloudflare Workers, Vercel Edge)
 * - Filesystem: Persistent disk cache (**Node.js only** — not available on Workers/Edge)
 */
export type OgCacheConfig =
  | {
      /** Memory-based caching strategy (cross-platform) */
      type: 'memory';
      /** Time-to-live in milliseconds (default: 7 days) */
      ttl?: number;
      /** Maximum number of items to cache (default: 100) */
      max?: number;
    }
  | {
      /**
       * Filesystem-based caching strategy.
       *
       * Only supported on Node.js. On Cloudflare Workers / Vercel Edge use `{ type: 'memory' }`.
       */
      type: 'filesystem';
      /** Directory to store cache files (default: '.ogify-cache') */
      dir?: string;
      /** Time-to-live in milliseconds (default: 7 days) */
      ttl?: number;
      /** Maximum number of items to cache (default: 100) */
      max?: number;
    };

/**
 * Supported font file formats.
 *
 * - `woff`: Web Open Font Format (modern, compressed)
 * - `ttf`: TrueType Font (legacy, larger file size)
 */
export type OgFontFormat = 'woff' | 'ttf';

/**
 * Configuration for a font used in OG image templates.
 *
 * Fonts can be loaded from three sources (in priority order):
 * 1. Pre-loaded binary data (via `data` property)
 * 2. Remote URL (via `url` property)
 * 3. Google Fonts API (automatic detection based on `name`)
 *
 * @example
 * // Load from Google Fonts (automatic)
 * const font1: OgFontConfig = {
 *   name: 'Inter',
 *   weight: 400,
 *   style: 'normal'
 * };
 *
 * @example
 * // Load from custom URL
 * const font2: OgFontConfig = {
 *   name: 'CustomFont',
 *   url: 'https://example.com/font.woff2',
 *   weight: 700
 * };
 *
 * @example
 * // Load from pre-loaded data
 * const font3: OgFontConfig = {
 *   name: 'MyFont',
 *   data: fontBuffer,
 *   weight: 400
 * };
 */
export type OgFontConfig = {
  /** The font family name (e.g., 'Inter', 'Roboto', 'Merriweather') */
  name: string;

  /** Font weight (100-900, default: 400) */
  weight?: FontWeight;

  /** Font style ('normal' or 'italic', default: 'normal') */
  style?: FontStyle;

  /** URL to the font file (for custom/self-hosted fonts) */
  url?: string;

  /** Pre-loaded font binary data (ArrayBuffer, Uint8Array, or Node Buffer) */
  data?: ArrayBuffer | Uint8Array;

  /** Font file format (default: 'woff') */
  format?: OgFontFormat;
};

/**
 * Props passed to template HTML rendering functions.
 *
 * Contains user-provided parameters and optional dimension overrides.
 * Templates use these props to generate dynamic HTML content.
 *
 * @example
 * const html = (props: OgTemplateOptions) => `
 *   <div style="width: ${props.width}px; height: ${props.height}px">
 *     <h1>${props.params.title}</h1>
 *     <p>${props.params.description}</p>
 *   </div>
 * `;
 */
export type OgTemplateOptions = {
  /** Custom fonts to use in this template */
  fonts?: OgFontConfig[];

  /** Optional emoji provider to use in this template */
  emojiProvider?: OgEmojiProvider;

  /**
   * SVG → PNG backend. Required on Cloudflare Workers / Vercel Edge.
   * On Node.js, defaults to `@resvg/resvg-js` when omitted.
   *
   * @see createNodeResvg from `@ogify/core/node`
   * @see createWasmResvg from `@ogify/core/wasm`
   */
  resvg?: OgResvgBackend;

  /** Optional custom width in pixels (default: 1200) */
  width?: number;

  /** Optional custom height in pixels (default: 630) */
  height?: number;

  isRTL?: boolean;

  /**
   * Render scale factor for supersampling.
   *
   * Satori renders the SVG at the original `width × height`. Resvg then
   * rasterizes the vector SVG at `(width × scale) × (height × scale)` pixels.
   *
   * The template renderer always receives the **original** width/height —
   * scale is an implementation detail of the rendering engine and is fully
   * backward compatible.
   *
   * Supports float values for fine-grained control:
   * - `1`    — no supersampling, output = 1200×630 (default)
   * - `1.25` — mild boost, output = 1500×787
   * - `1.5`  — good balance, output = 1800×945
   * - `2`    — @2x retina, output = 2400×1260 (recommended)
   * - `3`    — @3x ultra, output = 3600×1890
   * - `4`    — maximum allowed (clamped to prevent OOM)
   *
   * Values below `1` are clamped to `1`. Values above `4` are clamped to `4`.
   * The final pixel dimensions are rounded to integers.
   *
   * @default 1
   */
  scale?: number;
};

/**
 * Key-value pairs representing dynamic template parameters.
 *
 * Parameters are the data that gets injected into templates to create
 * personalized OG images. Values can be:
 * - Strings: Text content (titles, descriptions, names)
 * - String Arrays: Lists of tags, categories
 * - Numbers: Counts, dates, metrics
 * - Booleans: Flags, toggles, states
 *
 * @example
 * const params: OgTemplateParams = {
 *   title: 'My Blog Post',
 *   author: 'John Doe',
 *   views: 1234,
 *   published: true
 * };
 */
export type OgTemplateParams = Record<string, string | string[] | number | boolean>;

/** Return value of a template `renderer`: HTML string (parsed via satori-html) or a node tree for Satori. */
export type OgTemplateRenderResult = string | ReactNode;

/**
 * Complete definition of an Open Graph image template.
 *
 * A template is a reusable blueprint for generating OG images.
 * It defines:
 * - How to render HTML from parameters
 * - What fonts to use
 * - Metadata for identification
 */
export type OgTemplate<TParams = OgTemplateParams> = {
  /**
   * Returns HTML markup as a string (parsed with satori-html) or a React node tree passed directly to Satori.
   *
   * For strings: Tailwind-like utilities on `class` are supported via satori-html.
   * For React trees: use Satori-supported elements and `style` / experimental `tw` utilities.
   */
  renderer: (
    props: OgTemplateOptions & { params: TParams }
  ) => OgTemplateRenderResult | Promise<OgTemplateRenderResult>;

  /**
   * Custom fonts to use in this template.
   *
   * Fonts are loaded in the order specified and should cover
   * all characters used in the template.
   */
  fonts: OgFontConfig[];

  /**
   * Optional emoji provider to use in this template.
   *
   * If not specified, defaults to 'noto'.
   */
  emojiProvider?: OgEmojiProvider;
};

/**
 * Configuration for the TemplateRenderer class.
 *
 * Defines available templates, global defaults, and lifecycle hooks.
 * The handler manages a registry of templates and provides a unified
 * interface for rendering them to images.
 */
export type OgTemplateRenderer<
  TMap extends Record<string, OgTemplateParams> = Record<string, OgTemplateParams>,
> = {
  /** Map of template definitions to register, keyed by template ID */
  templates: { [K in keyof TMap]: OgTemplate<TMap[K]> };

  /**
   * Shared parameter values applied to all templates.
   *
   * These values are merged with user-provided parameters,
   * with user values taking precedence.
   */
  sharedParams?: Partial<TMap[keyof TMap]> | (() => Promise<Partial<TMap[keyof TMap]>>);

  /**
   * Cache configuration for rendered images.
   *
   * When provided, enables LRU caching to improve performance by:
   * - Reducing redundant renders for identical inputs
   * - Supporting memory (cross-platform) or filesystem (Node-only) strategies
   * - Configurable TTL and maximum cache size
   *
   * If not provided, falls back to in-memory caching.
   * On Cloudflare Workers / Vercel Edge, use `{ type: 'memory' }` only.
   */
  cache?: OgCacheConfig;

  /**
   * Default Resvg backend for all renders from this renderer.
   *
   * Per-call `options.resvg` overrides this value.
   * On Node.js, `@resvg/resvg-js` is used when both are omitted.
   */
  resvg?: OgResvgBackend;

  /**
   * Hook called before rendering.
   *
   * Useful for:
   * - Logging and analytics
   * - Parameter validation
   * - Authentication checks
   * - Rate limiting
   */
  beforeRender?: (templateId: keyof TMap, params: TMap[keyof TMap]) => void | Promise<void>;

  /**
   * Hook called after rendering.
   *
   * Useful for:
   * - Caching generated images
   * - Cleanup operations
   * - Sending notifications
   * - Updating metrics
   */
  afterRender?: (
    templateId: keyof TMap,
    params: TMap[keyof TMap],
    image: Uint8Array
  ) => void | Promise<void>;
};
