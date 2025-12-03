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

// Template management: defineTemplate, validateTemplate, TemplateHandler, createTemplateHandler
export * from './template';

// Image rendering: renderOgImage function for converting templates to PNG
export * from './renderer';

// Utility functions: deepMerge, mergeParams, mergeFonts, generateCacheKey, etc.
export * from './utils';

// Type definitions: OGTemplate, TemplateParams, FontConfig, TemplateHandlerConfig, etc.
export * from './types';
