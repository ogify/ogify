import type { OGTemplate, TemplateHandlerConfig, TemplateParams } from './types';
import { renderOgImage } from './renderer';

/**
 * Validates that a template configuration has all required fields.
 *
 * @param config - The template configuration to validate
 * @returns true if validation passes
 * @throws Error if any required field is missing
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

  // Ensure template defines its parameter schema
  if (!config.schema) {
    throw new Error('Template must have a schema');
  }

  return true;
}

/**
 * Define and validate a new OG template.
 * This is the primary way to create templates for use with the TemplateHandler.
 *
 * @param config - Complete template configuration including id, name, html function, and schema
 * @returns The validated template configuration
 * @throws Error if validation fails
 *
 * @example
 * const myTemplate = defineTemplate({
 *   id: 'blog-post',
 *   name: 'Blog Post',
 *   description: 'Template for blog post OG images',
 *   html: ({ params }) => `<div>${params.title}</div>`,
 *   schema: { title: { type: 'string', required: true } }
 * });
 */
export function defineTemplate(config: OGTemplate): OGTemplate {
  // Validate before returning to catch errors early
  validateTemplate(config);

  return config;
}

/**
 * Template Handler class for managing multiple templates and rendering them to images.
 * Provides a centralized registry for templates and handles the rendering pipeline.
 */
export class TemplateHandler {
  /** Configuration including global settings and lifecycle hooks */
  private config: TemplateHandlerConfig;

  /** Internal registry mapping template IDs to template definitions */
  private templates: Map<string, OGTemplate> = new Map();

  /**
   * Creates a new TemplateHandler instance.
   *
   * @param config - Handler configuration with templates and global settings
   */
  constructor(config: TemplateHandlerConfig) {
    this.config = config;
    // Register all provided templates on initialization
    this.registerTemplates(config.templates);
  }

  /**
   * Registers multiple templates into the internal registry.
   * Templates are indexed by their ID for fast lookup.
   *
   * @param templates - Array of template definitions to register
   */
  private registerTemplates(templates: OGTemplate[]): void {
    for (const item of templates) {
      this.templates.set(item.id, item);
    }
  }

  /**
   * Retrieves a template by its unique ID.
   *
   * @param id - The template ID to look up
   * @returns The template definition, or undefined if not found
   */
  getTemplate(id: string): OGTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Renders a template to a PNG image buffer.
   *
   * @param templateId - ID of the template to render
   * @param params - Parameters to pass to the template
   * @returns Promise resolving to a PNG image buffer
   * @throws Error if template is not found
   *
   * @example
   * const imageBuffer = await handler.renderToImage('blog-post', {
   *   title: 'My Blog Post',
   *   author: 'John Doe'
   * });
   */
  async renderToImage(templateId: string, params: TemplateParams): Promise<Buffer> {
    // Look up the template in the registry
    const template = this.getTemplate(templateId);

    // Fail fast if template doesn't exist
    if (!template) {
      throw new Error(`Template '${templateId}' not found`);
    }

    // Delegate to the core rendering function
    return renderOgImage(template, params);
  }
}

/**
 * Factory function to create a new TemplateHandler instance.
 * Convenience wrapper around the TemplateHandler constructor.
 *
 * @param config - Handler configuration with templates and settings
 * @returns A new TemplateHandler instance
 *
 * @example
 * const handler = createTemplateHandler({
 *   templates: [blogTemplate, productTemplate],
 *   defaultParams: { brand: 'My Company' }
 * });
 */
export function createTemplateHandler(config: TemplateHandlerConfig): TemplateHandler {
  return new TemplateHandler(config);
}
