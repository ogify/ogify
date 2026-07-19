/**
 * Runtime-neutral public API shared by conditioned package entry points.
 */

export * from './renderer';
export * from './template';
export * from './utils/clsx';
export * from './utils/html-snippet';
export * from './types';

export { createAutoResvg } from './backends/auto';
export { detectRuntime, isNodeRuntime, isEdgeRuntime } from './backends/runtime';
export type { OgRuntimeKind } from './backends/runtime';
