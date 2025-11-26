import type {
  OGTemplate,
  TemplateProps,
  ThemeConfig,
  FontConfig,
  MergedParams,
  TemplateRegistration,
  TemplateHandlerConfig,
  TemplateDiscoveryInfo,
} from './types';
import {
  mergeParams,
  mergeThemes,
  mergeFonts,
  zodToJsonSchema,
  extractSchemaFields,
} from './utils';
import { renderTemplateToImage } from './renderer';

/**
 * Define a new OG template
 */
export function defineTemplate<T>(
  config: Omit<OGTemplate<T>, 'component'> & {
    component: (props: TemplateProps<T>) => any;
  }
): OGTemplate<T> {
  return {
    ...config,
    component: config.component,
  };
}

/**
 * Create a template registration
 */
export function createTemplateRegistration<T>(
  template: OGTemplate<T>,
  config?: Omit<TemplateRegistration<T>, 'template'>
): TemplateRegistration<T> {
  return {
    template,
    ...config,
  };
}

/**
 * Process template parameters with merging and validation
 */
export function processTemplateParams<T>(
  template: OGTemplate<T>,
  registration: TemplateRegistration<T>,
  globalDefaults?: Record<string, any>,
  globalTheme?: ThemeConfig,
  requestParams?: Partial<T>
): MergedParams<T> {
  // Merge parameters in priority order
  const mergedParams = mergeParams(
    template.defaultParams,
    typeof registration.defaultParams === 'function'
      ? registration.defaultParams()
      : registration.defaultParams,
    globalDefaults,
    requestParams
  );

  // Validate parameters
  const validatedParams = template.schema.parse(mergedParams) as T;

  // Apply transform if provided
  const transformedParams = registration.transform
    ? registration.transform(validatedParams)
    : validatedParams;

  // Apply custom validation
  if (registration.validate) {
    const validationResult = registration.validate(transformedParams);
    if (validationResult !== true) {
      throw new Error(`Validation failed: ${validationResult}`);
    }
  }

  // Merge themes
  const mergedTheme = mergeThemes(
    template.theme,
    typeof registration.theme === 'string' ? { name: registration.theme } : registration.theme,
    globalTheme
  );

  // Merge fonts
  const mergedFonts = mergeFonts(template.fonts || [], registration.template.fonts || []);

  return {
    params: transformedParams,
    theme: mergedTheme,
    fonts: mergedFonts,
  };
}

/**
 * Render a template component with merged parameters
 */
export function renderTemplate<T>(
  template: OGTemplate<T>,
  mergedParams: MergedParams<T>,
  width: number = 1200,
  height: number = 630
): any {
  return template.component({
    params: mergedParams.params,
    theme: mergedParams.theme,
    width,
    height,
  });
}

/**
 * Template Handler class for managing templates and rendering
 */
export class TemplateHandler {
  private config: TemplateHandlerConfig;
  private templates: Map<string, TemplateRegistration<any>> = new Map();

  constructor(config: TemplateHandlerConfig) {
    this.config = config;
    this.registerTemplates(config.templates);
  }

  private registerTemplates(templates: (OGTemplate | TemplateRegistration)[]): void {
    for (const item of templates) {
      const registration = 'component' in item ? { template: item, enabled: true } : item;

      if (registration.enabled !== false) {
        this.templates.set(registration.template.id, registration);
      }
    }
  }

  /**
   * Get a template by ID
   */
  getTemplate<T = any>(id: string): TemplateRegistration<T> | undefined {
    return this.templates.get(id);
  }

  /**
   * List all available templates
   */
  listTemplates(): TemplateDiscoveryInfo[] {
    const result: TemplateDiscoveryInfo[] = [];

    for (const [id, registration] of this.templates) {
      const template = registration.template;
      const { required, optional } = extractSchemaFields(template.schema);

      result.push({
        id,
        name: template.name,
        description: registration.metadata?.description || template.description,
        category: template.category,
        tags: [...(template.tags || []), ...(registration.metadata?.tags || [])],
        schema: zodToJsonSchema(template.schema),
        defaultParams: registration.defaultParams,
        requiredParams: required,
        optionalParams: optional,
        theme:
          typeof registration.theme === 'string'
            ? { name: registration.theme }
            : registration.theme,
        metadata: registration.metadata,
        enabled: registration.enabled,
        preview: registration.metadata?.preview,
        exampleUrl: `/api/og?template=${id}`,
      });
    }

    return result.sort((a, b) => 0); // Simple sort for now
  }

  /**
   * Render a template to image
   */
  async renderToImage(
    templateId: string,
    params: Record<string, any> = {},
    options: {
      width?: number;
      height?: number;
      format?: 'png' | 'svg';
    } = {}
  ): Promise<Buffer> {
    const registration = this.getTemplate(templateId);
    if (!registration) {
      throw new Error(`Template '${templateId}' not found`);
    }

    const mergedParams = processTemplateParams(
      registration.template,
      registration,
      this.config.globalDefaults,
      this.config.globalTheme,
      params
    );

    return renderTemplateToImage(registration.template, mergedParams, {
      width: options.width,
      height: options.height,
      format: options.format,
      fonts: mergedParams.fonts,
      theme: mergedParams.theme,
    });
  }

  /**
   * Generate OG link for a template
   */
  generateOGLink(
    templateId: string,
    params: Record<string, any> = {},
    options: {
      baseUrl?: string;
      defaults?: Record<string, any>;
    } = {}
  ): string {
    const baseUrl = options.baseUrl || '/api/og';
    const mergedParams = {
      template: templateId,
      ...options.defaults,
      ...params,
    };

    const queryString = new URLSearchParams(mergedParams).toString();
    return `${baseUrl}?${queryString}`;
  }
}

/**
 * Create a template handler instance
 */
export function createTemplateHandler(config: TemplateHandlerConfig): TemplateHandler {
  return new TemplateHandler(config);
}
