/**
 * @module @ogify/core
 *
 * Core package for generating Open Graph (OG) images from templates.
 * This module provides the foundational functionality for:
 * - Defining and managing OG image templates
 * - Rendering templates to PNG images
 * - Type definitions for template configuration
 * - Utility functions for parameter merging and caching
 */

// Template management: defineTemplate, validateTemplate, TemplateRenderer, createRenderer
export * from './renderer';

// Image rendering: renderTemplate function for converting templates to PNG
export * from './template';

// Utility functions: deepMerge, mergeParams, mergeFonts, generateCacheKey, etc.
export * from './utils/font-fetcher';

// Type definitions: OgTemplate, OgTemplateParams, OgFontConfig, OgTemplateRenderer, etc.
export * from './types';
