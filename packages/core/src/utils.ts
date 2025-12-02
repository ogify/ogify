import type { FontConfig } from './types';

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
 * Convert schema to JSON schema representation
 */
export function schemaToJsonSchema(schema: any): any {
  try {
    // For simple schemas, return a basic representation
    if (schema && typeof schema.getFields === 'function') {
      const fields = schema.getFields();
      return {
        type: 'object',
        properties: {},
        required: fields?.required || [],
        optional: fields?.optional || [],
      };
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Extract required and optional parameters from schema
 */
export function extractSchemaFields(schema: any): {
  required: string[];
  optional: string[];
} {
  const required: string[] = [];
  const optional: string[] = [];

  try {
    if (schema && typeof schema.getFields === 'function') {
      const fields = schema.getFields();
      return {
        required: fields?.required || [],
        optional: fields?.optional || [],
      };
    }
  } catch {
    // Fallback if schema parsing fails
  }

  return { required, optional };
}
