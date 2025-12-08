/**
 * Type definitions for the OGify core library.
 *
 * This module provides TypeScript types and interfaces for:
 * - Font configuration and loading
 * - Template definition and parameters
 * - Template handler configuration
 * - Emoji providers
 */

import type { FontStyle, FontWeight } from 'satori';

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
export type EmojiProvider = 'twemoji' | 'fluent' | 'fluentFlat' | 'noto' | 'blobmoji' | 'openmoji';

/**
 * Supported font file formats.
 *
 * - `woff`: Web Open Font Format (modern, compressed)
 * - `ttf`: TrueType Font (legacy, larger file size)
 */
export type FontFormat = 'woff' | 'ttf';

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
 * const font1: FontConfig = {
 *   name: 'Inter',
 *   weight: 400,
 *   style: 'normal'
 * };
 *
 * @example
 * // Load from custom URL
 * const font2: FontConfig = {
 *   name: 'CustomFont',
 *   url: 'https://example.com/font.woff2',
 *   weight: 700
 * };
 *
 * @example
 * // Load from pre-loaded data
 * const font3: FontConfig = {
 *   name: 'MyFont',
 *   data: fontBuffer,
 *   weight: 400
 * };
 */
export type FontConfig = {
  /** The font family name (e.g., 'Inter', 'Roboto', 'Merriweather') */
  name: string;

  /** Font weight (100-900, default: 400) */
  weight?: FontWeight;

  /** Font style ('normal' or 'italic', default: 'normal') */
  style?: FontStyle;

  /** URL to the font file (for custom/self-hosted fonts) */
  url?: string;

  /** Pre-loaded font binary data (ArrayBuffer or Buffer) */
  data?: Buffer | ArrayBuffer;

  /** Font file format (default: 'woff') */
  format?: FontFormat;
};

/**
 * Props passed to template HTML rendering functions.
 *
 * Contains user-provided parameters and optional dimension overrides.
 * Templates use these props to generate dynamic HTML content.
 *
 * @example
 * const html = (props: TemplateProps) => `
 *   <div style="width: ${props.width}px; height: ${props.height}px">
 *     <h1>${props.params.title}</h1>
 *     <p>${props.params.description}</p>
 *   </div>
 * `;
 */
export interface TemplateProps {
  /** User-provided parameters that populate the template (e.g., title, description, author) */
  params: TemplateParams;

  /** Optional custom width in pixels (default: 1200) */
  width?: number;

  /** Optional custom height in pixels (default: 630) */
  height?: number;
}

/**
 * Key-value pairs representing dynamic template parameters.
 *
 * Parameters are the data that gets injected into templates to create
 * personalized OG images. Values can be:
 * - Strings: Text content (titles, descriptions, names)
 * - Numbers: Counts, dates, metrics
 * - Booleans: Flags, toggles, states
 *
 * @example
 * const params: TemplateParams = {
 *   title: 'My Blog Post',
 *   author: 'John Doe',
 *   views: 1234,
 *   published: true
 * };
 */
export type TemplateParams = Record<string, string | number | boolean>;

/**
 * Complete definition of an Open Graph image template.
 *
 * A template is a reusable blueprint for generating OG images.
 * It defines:
 * - How to render HTML from parameters
 * - What fonts to use
 * - Metadata for identification
 *
 * Templates are registered with a TemplateHandler and can be
 * rendered to PNG images on demand.
 *
 * @example
 * const blogTemplate: OGTemplate = {
 *   id: 'blog-post',
 *   name: 'Blog Post',
 *   description: 'Template for blog post OG images',
 *   html: ({ params }) => `
 *     <div style="display: flex; flex-direction: column;">
 *       <h1>${params.title}</h1>
 *       <p>${params.description}</p>
 *     </div>
 *   `,
 *   fonts: [
 *     { name: 'Inter', weight: 700 },
 *     { name: 'Inter', weight: 400 }
 *   ],
 *   emojiProvider: 'twemoji'
 * };
 */
export interface OGTemplate {
  /** Unique identifier for this template (e.g., 'blog-post', 'product-card') */
  id: string;

  /** Human-readable name for display purposes */
  name: string;

  /** Brief description of what this template is used for */
  description: string;

  /**
   * Function that generates HTML markup from template parameters.
   *
   * The HTML should use inline styles (Tailwind-like utilities are supported).
   * Flexbox and basic CSS properties are supported by Satori.
   */
  html: (props: TemplateProps) => string;

  /**
   * Custom fonts to use in this template.
   *
   * Fonts are loaded in the order specified and should cover
   * all characters used in the template.
   */
  fonts: FontConfig[];

  /**
   * Optional emoji provider to use in this template.
   *
   * If not specified, defaults to 'noto'.
   */
  emojiProvider?: EmojiProvider;
}

/**
 * Configuration for the TemplateHandler class.
 *
 * Defines available templates, global defaults, and lifecycle hooks.
 * The handler manages a registry of templates and provides a unified
 * interface for rendering them to images.
 *
 * @example
 * const config: TemplateHandlerConfig = {
 *   templates: [blogTemplate, productTemplate],
 *   defaultParams: {
 *     brand: 'My Company',
 *     logo: 'https://example.com/logo.png'
 *   },
 *   beforeRender: async (templateId, params) => {
 *     console.log(`Rendering ${templateId} with params:`, params);
 *   },
 *   afterRender: async (templateId, params) => {
 *     console.log(`Rendered ${templateId} successfully`);
 *   }
 * };
 */
export interface TemplateHandlerConfig {
  /** Array of template definitions to register */
  templates: OGTemplate[];

  /**
   * Default parameter values applied to all templates.
   *
   * These values are merged with user-provided parameters,
   * with user values taking precedence.
   */
  defaultParams?: TemplateParams;

  /**
   * Hook called before rendering.
   *
   * Useful for:
   * - Logging and analytics
   * - Parameter validation
   * - Authentication checks
   * - Rate limiting
   */
  beforeRender?: (templateId: string, params: TemplateParams) => void | Promise<void>;

  /**
   * Hook called after rendering.
   *
   * Useful for:
   * - Caching generated images
   * - Cleanup operations
   * - Sending notifications
   * - Updating metrics
   */
  afterRender?: (templateId: string, params: TemplateParams) => void | Promise<void>;
}
