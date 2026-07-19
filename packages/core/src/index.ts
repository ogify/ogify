/**
 * @module @ogify/core
 *
 * Default Node.js / Vercel Serverless entry.
 */

import { registerAutoBackendFactory } from './backends/auto';
import { createNodeResvg } from './backends/node';

registerAutoBackendFactory(async () => createNodeResvg(), 'node');

export * from './core';
