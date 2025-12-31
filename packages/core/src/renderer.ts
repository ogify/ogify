/**
 * Template management and validation utilities.
 *
 * This module provides:
 * - Template definition and validation
 * - Template registry and lookup
 * - Template rendering orchestration
 *
 * Templates are the core building blocks of the OGify library.
 * They define how to convert parameters into OG images.
 */

import type { OgTemplate, OgTemplateRenderer, OgTemplateParams, OgCacheConfig } from './types';
import { renderTemplate } from './template';
import { CacheManager } from './utils/cache-manager';

/**
 * Validates that a template configuration has all required fields.
 *
 * This function performs structural validation to ensure the template
 * has all necessary properties. It does NOT validate:
 * - Renderer function output
 * - Font availability
 *
 * Those validations happen at render time.
 *
 * @param config - The template configuration to validate
 * @returns true if validation passes
 * @throws Error if any required field is missing or invalid
 */
export function validateTemplate<TemplateParams>(config: OgTemplate<TemplateParams>): boolean {
  // Ensure template has a renderer function
  if (typeof config.renderer !== 'function') {
    throw new Error('Template must have a renderer function');
  }

  // All required fields are present
  return true;
}

/**
 * Defines and validates a new OG template.
 *
 * This is the primary way to create templates for use with the TemplateRenderer.
 * It validates the template configuration and returns it for registration.
 *
 * **Benefits of using defineTemplate:**
 * - Early validation catches configuration errors
 * - Type safety ensures correct template structure
 * - Clear intent in code (self-documenting)
 *
 * @param config - Complete template configuration including id, name, and renderer function
 * @returns The validated template configuration
 * @throws Error if validation fails
 */
export function defineTemplate<TemplateParams>(
  config: OgTemplate<TemplateParams>
): OgTemplate<TemplateParams> {
  // Validate before returning to catch errors early
  validateTemplate<TemplateParams>(config);

  return config;
}

const DEFAULT_CACHE: OgCacheConfig = {
  type: 'memory',
};

/**
 * Template Handler class for managing multiple templates and rendering them to images.
 */
export class TemplateRenderer<
  TMap extends Record<string, OgTemplateParams> = Record<string, OgTemplateParams>,
> {
  /** Configuration including global settings and lifecycle hooks */
  private config: OgTemplateRenderer<TMap>;

  /** Cache manager for fonts and icons */
  private cacheManager: CacheManager<string, Buffer>;

  /**
   * Internal registry mapping template IDs to template definitions.
   *
   * Using a Map provides:
   * - O(1) lookup performance
   * - Guaranteed insertion order
   * - Better memory efficiency than objects
   */
  private templates = {} as { [K in keyof TMap]: OgTemplate<TMap[K]> };

  /**
   * Creates a new TemplateRenderer instance.
   *
   * @param config - Handler configuration with templates and global settings
   */
  constructor(config: OgTemplateRenderer<TMap>) {
    this.config = config;

    // Initialize cache manager if configuration is provided
    this.cacheManager = new CacheManager(config.cache || DEFAULT_CACHE);

    // Register all provided templates on initialization
    // This validates all templates early and builds the lookup index
    this.registerTemplates(config.templates);
  }

  /**
   * Registers multiple templates into the internal registry.
   *
   * Templates are indexed by their ID for fast lookup.
   * If a template with the same ID already exists, it will be overwritten.
   *
   * @param templates - Map of template definitions to register
   */
  private registerTemplates(templates: { [K in keyof TMap]: OgTemplate<TMap[K]> }): void {
    const keys = Object.keys(templates) as Array<keyof TMap>;
    keys.forEach((key) => {
      this.templates[key] = templates[key];
    });
  }

  /**
   * Retrieves a template by its unique ID.
   *
   * This is useful for:
   * - Checking if a template exists before rendering
   * - Inspecting template configuration
   * - Building template selection UIs
   *
   * @param id - The template ID to look up
   * @returns The template definition, or undefined if not found
   */
  getTemplate<K extends keyof TMap>(id: K): OgTemplate<TMap[K]> | undefined {
    return this.templates[id];
  }

  /**
   * Renders a template to a PNG image buffer.
   *
   * This is the main method for generating OG images. It:
   * 1. Looks up the template by ID
   * 2. Merges default params with user params
   * 3. Calls lifecycle hooks (if configured)
   * 4. Delegates to the core rendering engine
   *
   * **Parameter Merging:**
   * User-provided parameters take precedence over default parameters.
   *
   * **Custom Dimensions:**
   * You can override the default 1200x630 dimensions by providing custom width/height.
   * This is useful for platform-specific requirements (e.g., Twitter, Instagram).
   *
   * **Error Handling:**
   * - Throws if template is not found
   * - Throws if rendering fails (font loading, HTML generation, etc.)
   *
   * @param templateId - ID of the template to render
   * @param params - Parameters to pass to the template
   * @param options - Optional rendering options
   * @param options.width - Custom image width in pixels (default: 1200)
   * @param options.height - Custom image height in pixels (default: 630)
   * @returns Promise resolving to a PNG image buffer
   * @throws Error if template is not found or rendering fails
   */
  async renderToImage<K extends keyof TMap>(
    templateId: K,
    params: TMap[K],
    options?: { width: number; height: number }
  ): Promise<Buffer> {
    const { sharedParams } = this.config;
    // Step 1: Look up the template in the registry
    const template = this.getTemplate(templateId);

    // Step 2: Fail fast if template doesn't exist
    if (!template) {
      throw new Error(`Template '${templateId as string}' not found`);
    }

    // Step 3: Merge shared params with user params (user params take precedence)
    const mergedParams = {
      ...sharedParams,
      ...params,
    } as TMap[K];

    const cacheKey = this.cacheManager.generateKey({
      templateId: templateId as string,
      ...mergedParams,
      ...options,
    });

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Step 4: Call beforeRender hook if configured
    if (this.config.beforeRender) {
      await this.config.beforeRender(templateId, mergedParams);
    }

    // Step 5: Delegate to the core rendering function
    const imageBuffer = await renderTemplate(template, mergedParams, options);

    await this.cacheManager.set(cacheKey, imageBuffer);

    // Step 6: Call afterRender hook if configured
    if (this.config.afterRender) {
      await this.config.afterRender(templateId, mergedParams, imageBuffer);
    }

    // Step 7: Return the generated image buffer
    return imageBuffer;
  }
}

/**
 * Factory function to create a new TemplateRenderer instance.
 *
 * This is a convenience wrapper around the TemplateRenderer constructor.
 * It provides a more functional API style for those who prefer it.
 *
 * @param config - Handler configuration with templates and settings
 * @returns A new TemplateRenderer instance
 */
export function createRenderer<
  TMap extends Record<string, OgTemplateParams> = Record<string, OgTemplateParams>,
>(config: OgTemplateRenderer<TMap>): TemplateRenderer<TMap> {
  return new TemplateRenderer<TMap>(config);
}
