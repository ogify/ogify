import type { FontConfig } from './types';

/**
 * Recursively merges multiple objects, with later sources taking priority.
 * Nested objects are merged deeply rather than replaced entirely.
 * 
 * @param target - The base object to merge into
 * @param sources - One or more source objects to merge (undefined values are skipped)
 * @returns A new merged object
 * 
 * @example
 * deepMerge(
 *   { a: 1, b: { x: 10 } },
 *   { b: { y: 20 }, c: 3 }
 * )
 * // Result: { a: 1, b: { x: 10, y: 20 }, c: 3 }
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: (Partial<T> | undefined)[]
): T {
  // Start with a shallow copy of the target
  const result = { ...target } as any;

  // Process each source object in order
  for (const source of sources) {
    if (!source) continue; // Skip undefined/null sources

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        // If both values are plain objects, merge them recursively
        if (isObject(sourceValue) && isObject(targetValue)) {
          result[key] = deepMerge(targetValue, sourceValue);
        } else if (sourceValue !== undefined) {
          // Otherwise, source value overwrites target value
          result[key] = sourceValue;
        }
      }
    }
  }

  return result;
}

/**
 * Type guard to check if a value is a plain object (not null, not an array).
 * Used to determine if deep merging should be applied.
 * 
 * @param value - Value to check
 * @returns true if value is a plain object
 */
function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Merges template parameters from multiple sources in priority order.
 * Priority (lowest to highest): template defaults → registration defaults → global defaults → request params
 * 
 * @param templateDefaults - Default values defined in the template itself
 * @param registrationDefaults - Defaults provided when registering the template
 * @param globalDefaults - Global defaults from TemplateHandlerConfig
 * @param requestParams - User-provided parameters for this specific render
 * @returns Merged parameters object
 * 
 * @example
 * mergeParams(
 *   { theme: 'light' },           // template default
 *   { brand: 'Acme' },            // registration default
 *   { lang: 'en' },               // global default
 *   { title: 'Hello', theme: 'dark' } // request params (highest priority)
 * )
 * // Result: { theme: 'dark', brand: 'Acme', lang: 'en', title: 'Hello' }
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
 * Merges multiple font configuration arrays, deduplicating by font name.
 * When multiple fonts have the same name, the last one wins.
 * 
 * @param fontArrays - Variable number of font arrays to merge (undefined values are filtered out)
 * @returns Deduplicated array of font configurations
 * 
 * @example
 * mergeFonts(
 *   [{ name: 'Inter', data: buffer1, weight: 400 }],
 *   [{ name: 'Inter', data: buffer2, weight: 700 }],
 *   [{ name: 'Roboto', data: buffer3, weight: 400 }]
 * )
 * // Result: [{ name: 'Inter', weight: 700, ... }, { name: 'Roboto', weight: 400, ... }]
 */
export function mergeFonts(...fontArrays: (FontConfig[] | undefined)[]): FontConfig[] {
  // Flatten all arrays and remove undefined/null entries
  const allFonts = fontArrays.filter(Boolean).flat();
  const fontMap = new Map<string, FontConfig>();

  // Use font name as key, later fonts override earlier ones
  // This allows template-specific fonts to override global fonts
  for (const font of allFonts) {
    if (font) {
      fontMap.set(font.name, font);
    }
  }

  return Array.from(fontMap.values());
}

/**
 * Generates a cache key for template rendering based on template ID and parameters.
 * Useful for caching rendered images to avoid redundant rendering.
 * 
 * @param templateId - ID of the template being rendered
 * @param params - Parameters passed to the template
 * @param customKeyFn - Optional custom function to generate cache keys
 * @returns A cache key string
 * 
 * @example
 * generateCacheKey('blog-post', { title: 'Hello', views: 100 })
 * // Result: 'blog-post:a3f2c1' (hash will vary)
 */
export function generateCacheKey(
  templateId: string,
  params: any,
  customKeyFn?: (templateId: string, params: any) => string
): string {
  // Allow custom cache key generation for advanced use cases
  if (customKeyFn) {
    return customKeyFn(templateId, params);
  }

  // Stringify params with sorted keys to ensure consistent hashing
  // (same params in different order should produce same key)
  const paramsString = JSON.stringify(params, Object.keys(params).sort());
  return `${templateId}:${hashString(paramsString)}`;
}

/**
 * Simple and fast string hashing function using the djb2 algorithm variant.
 * Produces a base-36 encoded hash suitable for cache keys.
 * 
 * Note: This is NOT cryptographically secure. Use only for cache keys, not security.
 * 
 * @param str - String to hash
 * @returns Base-36 encoded hash string
 */
function hashString(str: string): string {
  let hash = 0;
  
  // djb2 hash algorithm: hash = hash * 33 + char
  // Optimized as: hash = (hash << 5) - hash + char
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char; // Multiply by 33 and add char
    hash = hash & hash; // Convert to 32-bit integer (bitwise AND with itself)
  }
  
  // Convert to base-36 for compact representation (0-9, a-z)
  return Math.abs(hash).toString(36);
}

/**
 * Converts a template schema to JSON Schema format.
 * This is a simplified converter for basic schema introspection.
 * 
 * @param schema - Template schema object
 * @returns JSON Schema representation
 * 
 * Note: This function appears to be incomplete and may need enhancement
 * to properly convert TemplateSchema to full JSON Schema format.
 */
export function schemaToJsonSchema(schema: any): any {
  try {
    // Check if schema has a getFields method (for schema objects with methods)
    if (schema && typeof schema.getFields === 'function') {
      const fields = schema.getFields();
      return {
        type: 'object',
        properties: {}, // TODO: Populate properties from fields
        required: fields?.required || [],
        optional: fields?.optional || [],
      };
    }
    return {};
  } catch {
    // Silently fail and return empty schema on error
    return {};
  }
}

/**
 * Extracts lists of required and optional parameter names from a schema.
 * Useful for validation and documentation generation.
 * 
 * @param schema - Template schema object
 * @returns Object containing arrays of required and optional field names
 * 
 * Note: This function appears to expect schemas with a getFields() method,
 * but TemplateSchema is currently defined as a plain object type.
 * May need refactoring to work with the current TemplateSchema definition.
 */
export function extractSchemaFields(schema: any): {
  required: string[];
  optional: string[];
} {
  const required: string[] = [];
  const optional: string[] = [];

  try {
    // Check if schema has a getFields method
    if (schema && typeof schema.getFields === 'function') {
      const fields = schema.getFields();
      return {
        required: fields?.required || [],
        optional: fields?.optional || [],
      };
    }
  } catch {
    // Silently handle errors and return empty arrays
  }

  return { required, optional };
}
