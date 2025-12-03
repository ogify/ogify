/**
 * Configuration for custom fonts used in OG image templates.
 * Fonts must be provided as binary data (ArrayBuffer or Buffer).
 */
export interface FontConfig {
  /** The font family name (e.g., 'Inter', 'Roboto') */
  name: string;
  
  /** Binary font data loaded from a .ttf, .otf, or .woff file */
  data: ArrayBuffer | Buffer;
  
  /** Font weight (100-900). Common values: 300 (light), 400 (regular), 700 (bold) */
  weight?: number;
  
  /** Font style variant */
  style?: 'normal' | 'italic';
}

/**
 * Props passed to template HTML rendering functions.
 * Contains user-provided parameters and optional dimensions.
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
 * Values can be strings (text content), numbers (counts, dates), or booleans (flags).
 */
export type TemplateParams = Record<string, string | number | boolean>;

/**
 * Schema definition for template parameters.
 * Defines the expected type, requirement status, and default value for each parameter.
 * Used for validation and documentation of template inputs.
 * 
 * @example
 * const schema: TemplateSchema = {
 *   title: { type: 'string', required: true },
 *   views: { type: 'number', defaultValue: 0 },
 *   published: { type: 'boolean', defaultValue: false }
 * };
 */
export type TemplateSchema = Record<
  string,
  | {
      type: 'string';
      /** Whether this parameter must be provided */
      required?: boolean;
      /** Default value if not provided */
      defaultValue?: string;
    }
  | {
      type: 'number';
      required?: boolean;
      defaultValue?: number;
    }
  | {
      type: 'boolean';
      required?: boolean;
      defaultValue?: boolean;
    }
>;

/**
 * Complete definition of an Open Graph image template.
 * Templates define how to render dynamic OG images based on user parameters.
 */
export interface OGTemplate {
  /** Unique identifier for this template (e.g., 'blog-post', 'product-card') */
  id: string;
  
  /** Human-readable name for display purposes */
  name: string;
  
  /** Brief description of what this template is used for */
  description: string;
  
  /** Function that generates HTML markup from template parameters */
  html: (props: TemplateProps) => string;
  
  /** Schema defining expected parameters and their types */
  schema: TemplateSchema;
  
  /** Optional custom fonts to use in this template */
  fonts?: FontConfig[];
}

/**
 * Configuration for the TemplateHandler class.
 * Defines available templates, global defaults, and lifecycle hooks.
 */
export interface TemplateHandlerConfig {
  /** Array of template definitions to register */
  templates: OGTemplate[];
  
  /** Default parameter values applied to all templates */
  defaultParams?: TemplateParams;
  
  /** Global fonts available to all templates */
  fonts?: FontConfig[];
  
  /** Hook called before rendering (useful for logging, analytics, validation) */
  beforeRender?: (templateId: string, params: TemplateParams) => void | Promise<void>;
  
  /** Hook called after rendering (useful for caching, cleanup, notifications) */
  afterRender?: (templateId: string, params: TemplateParams) => void | Promise<void>;
}
