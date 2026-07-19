/**
 * Automatic Resvg backend selection — transparent by default.
 *
 * The package entry selected through conditional exports registers exactly one
 * factory:
 * - default import → native Node backend
 * - `workerd` → Cloudflare WASM backend
 * - `edge-light` → Vercel Edge WASM backend
 *
 * Explicit `resvg` on `createRenderer` / `renderTemplate` always wins.
 */

import type { OgResvgBackend } from './types';
import { detectRuntime } from './runtime';

type AutoBackendFactory = () => OgResvgBackend | Promise<OgResvgBackend>;

let backendPromise: Promise<OgResvgBackend> | null = null;
let platformFactory: AutoBackendFactory | undefined;
let platformName: string | undefined;

/**
 * Registers the backend factory selected by the active package export.
 *
 * @internal Platform entry points only.
 */
export function registerAutoBackendFactory(factory: AutoBackendFactory, name: string): void {
  platformFactory = factory;
  platformName = name;
  backendPromise = null;
}

/**
 * Creates a Resvg backend for the current runtime.
 *
 * Prefer omitting `resvg` on `createRenderer` — this is called automatically.
 * @example Transparent (recommended)
 * ```ts
 * import { createRenderer } from '@ogify/core';
 *
 * const renderer = createRenderer({
 *   templates: { ... },
 *   cache: { type: 'memory' },
 * });
 * ```
 *
 * @example Explicit override
 * ```ts
 * import { createRenderer } from '@ogify/core';
 * import { createNodeResvg } from '@ogify/core/node';
 *
 * const renderer = createRenderer({
 *   templates: { ... },
 *   resvg: createNodeResvg(),
 * });
 * ```
 */
export async function createAutoResvg(): Promise<OgResvgBackend> {
  if (!platformFactory) {
    const runtime = detectRuntime();
    throw new Error(
      `[@ogify/core] No automatic Resvg backend was registered for runtime "${runtime}". ` +
        'Import from "@ogify/core" through a supported package resolver, or pass an explicit `resvg` backend.'
    );
  }

  if (!backendPromise) {
    backendPromise = Promise.resolve(platformFactory()).catch((error) => {
      backendPromise = null;
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `[@ogify/core] Failed to initialize the automatic Resvg backend (${platformName}).\nCause: ${detail}`
      );
    });
  }

  return backendPromise;
}

/**
 * @internal Clears the cached auto backend (tests only).
 */
export function resetAutoResvgCache(): void {
  backendPromise = null;
  platformFactory = undefined;
  platformName = undefined;
}
