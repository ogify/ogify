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

// Utility functions: clsx.
export * from './utils/clsx';

// Utility functions: htmlSnippet.
export * from './utils/html-snippet';

// Type definitions: OgTemplate, OgTemplateParams, OgFontConfig, OgTemplateRenderer, etc.
export * from './types';

// Automatic Resvg backend selection (Node → native, Edge → WASM)
export { createAutoResvg } from './backends/auto';
export type { CreateAutoResvgOptions } from './backends/auto';
export { detectRuntime, isNodeRuntime, isEdgeRuntime } from './backends/runtime';
export type { OgRuntimeKind } from './backends/runtime';
