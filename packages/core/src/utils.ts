import type { ThemeConfig, FontConfig } from './types';

/**
 * Deep merge objects, with later sources taking priority
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: (Partial<T> | undefined)[]
): T {
  const result = { ...target } as any;

  for (const source of sources) {
    if (!source) continue;

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (isObject(sourceValue) && isObject(targetValue)) {
          result[key] = deepMerge(targetValue, sourceValue);
        } else if (sourceValue !== undefined) {
          result[key] = sourceValue;
        }
      }
    }
  }

  return result;
}

/**
 * Check if value is a plain object
 */
function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Merge template parameters in priority order
 */
export function mergeParams<T extends Record<string, any>>(
  templateDefaults?: Partial<T>,
  registrationDefaults?: Partial<T>,
  globalDefaults?: any,
  requestParams?: Partial<T>
): T {
  return deepMerge({} as T, templateDefaults, registrationDefaults, globalDefaults, requestParams);
}

/**
 * Merge theme configurations
 */
export function mergeThemes(
  templateTheme?: ThemeConfig,
  registrationTheme?: ThemeConfig | string,
  globalTheme?: ThemeConfig
): ThemeConfig {
  const themes = [templateTheme, globalTheme].filter(Boolean) as ThemeConfig[];

  if (typeof registrationTheme === 'string') {
    themes.push({ name: registrationTheme });
  } else if (registrationTheme) {
    themes.push(registrationTheme);
  }

  return deepMerge({}, ...themes);
}

/**
 * Merge font configurations
 */
export function mergeFonts(...fontArrays: (FontConfig[] | undefined)[]): FontConfig[] {
  const allFonts = fontArrays.filter(Boolean).flat();
  const fontMap = new Map<string, FontConfig>();

  // Use font name as key, later fonts override earlier ones
  for (const font of allFonts) {
    if (font) {
      fontMap.set(font.name, font);
    }
  }

  return Array.from(fontMap.values());
}

/**
 * Generate cache key for template rendering
 */
export function generateCacheKey(
  templateId: string,
  params: any,
  customKeyFn?: (templateId: string, params: any) => string
): string {
  if (customKeyFn) {
    return customKeyFn(templateId, params);
  }

  const paramsString = JSON.stringify(params, Object.keys(params).sort());
  return `${templateId}:${hashString(paramsString)}`;
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Convert Zod schema to JSON schema
 */
export function zodToJsonSchema(schema: any): any {
  try {
    return schema._def;
  } catch {
    return {};
  }
}

/**
 * Extract required and optional parameters from Zod schema
 */
export function extractSchemaFields(schema: any): {
  required: string[];
  optional: string[];
} {
  const required: string[] = [];
  const optional: string[] = [];

  try {
    const shape = schema._def?.shape;
    if (shape) {
      for (const [key, fieldSchema] of Object.entries(shape) as [string, any][]) {
        const isOptional =
          fieldSchema._def?.typeName === 'ZodOptional' ||
          fieldSchema._def?.typeName === 'ZodDefault';
        if (isOptional) {
          optional.push(key);
        } else {
          required.push(key);
        }
      }
    }
  } catch {
    // Fallback if schema parsing fails
  }

  return { required, optional };
}
