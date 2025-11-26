import { z } from 'zod';

// Font configuration
export interface FontConfig {
  name: string;
  data: ArrayBuffer | Buffer;
  weight?: number;
  style?: 'normal' | 'italic';
}

// Theme configuration
export interface ThemeConfig {
  name?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    accent?: string;
    error?: string;
    success?: string;
    warning?: string;
  };
  fonts?: FontConfig[];
  spacing?: Record<string, number>;
  borderRadius?: Record<string, number>;
  shadows?: Record<string, string>;
  typography?: {
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    fontWeight?: number;
    letterSpacing?: number;
  };
  custom?: Record<string, any>;
}

// Template component props
export interface TemplateProps<T = any> {
  params: T;
  theme?: ThemeConfig;
  width?: number;
  height?: number;
}

// Template definition
export interface OGTemplate<T = any> {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  schema: z.ZodSchema<T>;
  defaultParams?: Partial<T>;
  component: (props: TemplateProps<T>) => any;
  theme?: ThemeConfig;
  fonts?: FontConfig[];
}

// Template registration metadata
export interface TemplateMetadata {
  author?: string;
  version?: string;
  tags?: string[];
  description?: string;
  preview?: string;
  deprecated?: boolean;
  replacedBy?: string;
}

// Template registration configuration
export interface TemplateRegistration<T = any> {
  template: OGTemplate<T>;
  defaultParams?: Partial<T> | (() => Partial<T>);
  theme?: ThemeConfig | string;
  enabled?: boolean;
  metadata?: TemplateMetadata;
  transform?: (params: T) => T;
  validate?: (params: T) => boolean | string;
  priority?: number;
}

// Template handler configuration
export interface TemplateHandlerConfig {
  templates: (OGTemplate | TemplateRegistration)[];
  globalDefaults?: Record<string, any> | (() => Record<string, any>);
  globalTheme?: ThemeConfig;
  onError?: (error: Error, templateId: string, params?: any) => Response;
  cache?: {
    ttl?: number;
    staleWhileRevalidate?: number;
    vary?: string[];
    key?: (templateId: string, params: any) => string;
  };
  fonts?: FontConfig[];
  enableDiscovery?: boolean;
  beforeRender?: (templateId: string, params: any) => void | Promise<void>;
  afterRender?: (templateId: string, params: any, response: Response) => void | Promise<void>;
  rateLimit?: {
    max?: number;
    window?: number;
    keyGenerator?: (request: Request) => string;
  };
}

// Parameter merging result
export interface MergedParams<T = any> {
  params: T;
  theme: ThemeConfig;
  fonts: FontConfig[];
}

// Template discovery info
export interface TemplateDiscoveryInfo {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  schema: any; // JSON schema representation
  defaultParams?: any;
  requiredParams?: string[];
  optionalParams?: string[];
  theme?: ThemeConfig;
  metadata?: TemplateMetadata;
  enabled?: boolean;
  preview?: string;
  exampleUrl?: string;
}
