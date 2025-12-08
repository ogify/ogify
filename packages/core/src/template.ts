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

import type { OGTemplate, TemplateHandlerConfig, TemplateParams } from './types';
import { renderOgImage } from './renderer';

/**
 * Validates that a template configuration has all required fields.
 *
 * This function performs structural validation to ensure the template
 * has all necessary properties. It does NOT validate:
 * - HTML function output
 * - Font availability
 *
 * Those validations happen at render time.
 *
 * @param config - The template configuration to validate
 * @returns true if validation passes
 * @throws Error if any required field is missing or invalid
 *
 * @example
 * try {
 *   validateTemplate(myTemplate);
 *   console.log('Template is valid!');
 * } catch (error) {
 *   console.error('Template validation failed:', error.message);
 * }
 */
export function validateTemplate(config: OGTemplate): boolean {
  // Ensure template has a unique identifier
  if (!config.id) {
    throw new Error('Template must have an id');
  }

  // Ensure template has a human-readable name
  if (!config.name) {
    throw new Error('Template must have a name');
  }

  // Ensure template has an HTML rendering function
  if (!config.html) {
    throw new Error('Template must have an html function');
  }

  // All required fields are present
  return true;
}

/**
 * Defines and validates a new OG template.
 *
 * This is the primary way to create templates for use with the TemplateHandler.
 * It validates the template configuration and returns it for registration.
 *
 * **Benefits of using defineTemplate:**
 * - Early validation catches configuration errors
 * - Type safety ensures correct template structure
 * - Clear intent in code (self-documenting)
 *
 * @param config - Complete template configuration including id, name, and html function
 * @returns The validated template configuration
 * @throws Error if validation fails
 *
 * @example
 * const blogTemplate = defineTemplate({
 *   id: 'blog-post',
 *   name: 'Blog Post',
 *   description: 'Template for blog post OG images',
 *   html: ({ params }) => `
 *     <div style="display: flex; flex-direction: column; padding: 40px;">
 *       <h1 style="font-size: 60px;">${params.title}</h1>
 *       <p style="font-size: 30px;">${params.description}</p>
 *     </div>
 *   `,
 *   fonts: [
 *     { name: 'Inter', weight: 700 },
 *     { name: 'Inter', weight: 400 }
 *   ]
 * });
 */
export function defineTemplate(config: OGTemplate): OGTemplate {
  // Validate before returning to catch errors early
  validateTemplate(config);

  return config;
}

/**
 * Template Handler class for managing multiple templates and rendering them to images.
 *
 * The TemplateHandler provides:
 * - Centralized template registry
 * - Template lookup by ID
 * - Unified rendering interface
 * - Lifecycle hooks for custom behavior
 *
 * **Use Cases:**
 * - Multi-tenant applications with different OG image styles
 * - CMS systems with customizable OG templates
 * - API services that generate OG images on demand
 * - Static site generators with multiple page types
 *
 * @example
 * const handler = new TemplateHandler({
 *   templates: [blogTemplate, productTemplate, authorTemplate],
 *   defaultParams: {
 *     brand: 'My Company',
 *     logo: 'https://example.com/logo.png'
 *   }
 * });
 *
 * // Render a specific template
 * const image = await handler.renderToImage('blog-post', {
 *   title: 'My Blog Post',
 *   description: 'An amazing article'
 * });
 */
export class TemplateHandler {
  /** Configuration including global settings and lifecycle hooks */
  private config: TemplateHandlerConfig;

  /**
   * Internal registry mapping template IDs to template definitions.
   *
   * Using a Map provides:
   * - O(1) lookup performance
   * - Guaranteed insertion order
   * - Better memory efficiency than objects
   */
  private templates: Map<string, OGTemplate> = new Map();

  /**
   * Creates a new TemplateHandler instance.
   *
   * @param config - Handler configuration with templates and global settings
   *
   * @example
   * const handler = new TemplateHandler({
   *   templates: [template1, template2],
   *   beforeRender: async (id, params) => {
   *     console.log(`Rendering ${id}`);
   *   }
   * });
   */
  constructor(config: TemplateHandlerConfig) {
    this.config = config;

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
   * @param templates - Array of template definitions to register
   *
   * @example
   * // This is typically called internally by the constructor,
   * // but can be used to add templates dynamically
   * handler.registerTemplates([newTemplate1, newTemplate2]);
   */
  private registerTemplates(templates: OGTemplate[]): void {
    for (const template of templates) {
      // Store template in the registry using its ID as the key
      this.templates.set(template.id, template);
    }
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
   *
   * @example
   * const template = handler.getTemplate('blog-post');
   * if (template) {
   *   console.log(`Found template: ${template.name}`);
   * } else {
   *   console.log('Template not found');
   * }
   */
  getTemplate(id: string): OGTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Gets all registered template IDs.
   *
   * Useful for:
   * - Building template selection dropdowns
   * - Listing available templates in documentation
   * - Debugging template registration
   *
   * @returns Array of template IDs
   *
   * @example
   * const availableTemplates = handler.getTemplateIds();
   * console.log('Available templates:', availableTemplates);
   * // Output: ['blog-post', 'product-card', 'author-profile']
   */
  getTemplateIds(): string[] {
    return Array.from(this.templates.keys());
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
   *
   * @example
   * // Basic usage with default dimensions
   * const imageBuffer = await handler.renderToImage('blog-post', {
   *   title: 'My Blog Post',
   *   author: 'John Doe'
   * });
   *
   * @example
   * // Custom dimensions for Twitter (1200x675)
   * const twitterImage = await handler.renderToImage('blog-post', {
   *   title: 'My Blog Post'
   * }, {
   *   width: 1200,
   *   height: 675
   * });
   *
   * @example
   * // Save to file
   * import { writeFile } from 'fs/promises';
   * const buffer = await handler.renderToImage('blog-post', params);
   * await writeFile('og-image.png', buffer);
   *
   * @example
   * // Return from API endpoint
   * export async function GET(request: Request) {
   *   const { searchParams } = new URL(request.url);
   *   const title = searchParams.get('title') || 'Default Title';
   *
   *   const imageBuffer = await handler.renderToImage('blog-post', { title });
   *
   *   return new Response(imageBuffer, {
   *     headers: {
   *       'Content-Type': 'image/png',
   *       'Cache-Control': 'public, max-age=31536000, immutable'
   *     }
   *   });
   * }
   */
  async renderToImage(
    templateId: string,
    params: TemplateParams,
    options?: { width: number; height: number }
  ): Promise<Buffer> {
    // Step 1: Look up the template in the registry
    const template = this.getTemplate(templateId);

    // Step 2: Fail fast if template doesn't exist
    if (!template) {
      throw new Error(`Template '${templateId}' not found`);
    }

    // Step 3: Merge default params with user params (user params take precedence)
    const mergedParams = {
      ...this.config.defaultParams,
      ...params,
    };

    // Step 4: Call beforeRender hook if configured
    if (this.config.beforeRender) {
      await this.config.beforeRender(templateId, mergedParams);
    }

    // Step 5: Delegate to the core rendering function
    const imageBuffer = await renderOgImage(template, mergedParams, options);

    // Step 6: Call afterRender hook if configured
    if (this.config.afterRender) {
      await this.config.afterRender(templateId, mergedParams);
    }

    // Step 7: Return the generated image buffer
    return imageBuffer;
  }
}

/**
 * Factory function to create a new TemplateHandler instance.
 *
 * This is a convenience wrapper around the TemplateHandler constructor.
 * It provides a more functional API style for those who prefer it.
 *
 * **When to use this vs `new TemplateHandler()`:**
 * - Use this for a more functional style
 * - Use `new TemplateHandler()` for a more OOP style
 * - Both are functionally equivalent
 *
 * @param config - Handler configuration with templates and settings
 * @returns A new TemplateHandler instance
 *
 * @example
 * const handler = createTemplateHandler({
 *   templates: [blogTemplate, productTemplate],
 *   defaultParams: { brand: 'My Company' }
 * });
 *
 * const image = await handler.renderToImage('blog-post', {
 *   title: 'Hello World'
 * });
 */
export function createTemplateHandler(config: TemplateHandlerConfig): TemplateHandler {
  return new TemplateHandler(config);
}
