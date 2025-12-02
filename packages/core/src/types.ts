// Font configuration
export interface FontConfig {
  name: string;
  data: ArrayBuffer | Buffer;
  weight?: number;
  style?: 'normal' | 'italic';
}

// Template component props
export interface TemplateProps {
  params: TemplateParams;
  width?: number;
  height?: number;
}

export type TemplateParams = Record<string, string | number | boolean>;

export type TemplateSchema = Record<
  string,
  | {
      type: 'string';
      required?: boolean;
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

// Template definition
export interface OGTemplate {
  id: string;
  name: string;
  description: string;
  html: (props: TemplateProps) => string;
  schema: TemplateSchema;
  fonts?: FontConfig[];
}

// Template handler configuration
export interface TemplateHandlerConfig {
  templates: OGTemplate[];
  defaultParams?: TemplateParams;
  fonts?: FontConfig[];
  beforeRender?: (templateId: string, params: TemplateParams) => void | Promise<void>;
  afterRender?: (templateId: string, params: TemplateParams) => void | Promise<void>;
}
