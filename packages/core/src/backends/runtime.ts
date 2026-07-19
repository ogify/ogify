/**
 * Runtime detection helpers for choosing a Resvg backend.
 */

export type OgRuntimeKind = 'node' | 'edge' | 'unknown';

/**
 * Detects the current JavaScript runtime.
 *
 * - Cloudflare Workers expose `navigator.userAgent === 'Cloudflare-Workers'`
 * - Vercel Edge sets `globalThis.EdgeRuntime`
 * - Node.js (and Vercel Serverless) expose `process.versions.node`
 *
 * Note: Cloudflare `nodejs_compat` may set `process.versions.node`, so
 * Workers are detected *before* the Node check.
 */
export function detectRuntime(): OgRuntimeKind {
  if (typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers') {
    return 'edge';
  }

  // Vercel Edge Runtime
  if (typeof (globalThis as { EdgeRuntime?: unknown }).EdgeRuntime !== 'undefined') {
    return 'edge';
  }

  if (
    typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    typeof process.versions?.node === 'string'
  ) {
    return 'node';
  }

  return 'unknown';
}

export function isNodeRuntime(): boolean {
  return detectRuntime() === 'node';
}

export function isEdgeRuntime(): boolean {
  return detectRuntime() === 'edge';
}
