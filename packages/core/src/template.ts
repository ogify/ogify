import type { OGTemplate, TemplateHandlerConfig, TemplateParams } from './types';
import { renderOgImage } from './renderer';

export function validateTemplate(config: OGTemplate): boolean {
  if (!config.id) {
    throw new Error('Template must have an id');
  }

  if (!config.name) {
    throw new Error('Template must have a name');
  }

  if (!config.html) {
    throw new Error('Template must have an html function');
  }

  if (!config.schema) {
    throw new Error('Template must have a schema');
  }

  return true;
}

/**
 * Define a new OG template
 */
export function defineTemplate(config: OGTemplate): OGTemplate {
  validateTemplate(config);

  return config;
}

/**
 * Template Handler class for managing templates and rendering
 */
export class TemplateHandler {
  private config: TemplateHandlerConfig;
  private templates: Map<string, OGTemplate> = new Map();

  constructor(config: TemplateHandlerConfig) {
    this.config = config;
    this.registerTemplates(config.templates);
  }

  private registerTemplates(templates: OGTemplate[]): void {
    for (const item of templates) {
      this.templates.set(item.id, item);
    }
  }

  /**
   * Get a template by ID
   */
  getTemplate(id: string): OGTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Render a template to image
   */
  async renderToImage(templateId: string, params: TemplateParams): Promise<Buffer> {
    const template = this.getTemplate(templateId);

    if (!template) {
      throw new Error(`Template '${templateId}' not found`);
    }

    return renderOgImage(template, params);
  }
}

/**
 * Create a template handler instance
 */
export function createTemplateHandler(config: TemplateHandlerConfig): TemplateHandler {
  return new TemplateHandler(config);
}
