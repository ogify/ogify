/**
 * Cache management utilities using an LRU strategy.
 *
 * - Memory cache: works on Node, Cloudflare Workers, and Vercel Edge
 * - Filesystem cache: Node.js only (dynamically imported `node:fs`)
 */

import { LRUCache } from 'lru-cache';

import type { OgCacheConfig } from '../types';
import { sha256Hex } from './hash';

const DEFAULT_TTL = 1000 * 60 * 60 * 24 * 7;
const DEFAULT_MAX = 100;
const DEFAULT_CACHE_DIR = '.ogify-cache';

type FilesystemStore = typeof import('./filesystem-store');

/**
 * Unified cache for rendered images and downloaded assets.
 *
 * Value type is `Uint8Array` so the same API works across runtimes.
 */
export class CacheManager<K extends string = string, V extends Uint8Array = Uint8Array> {
  private cache?: LRUCache<K, V>;
  private config: OgCacheConfig;
  private cacheDir: string = DEFAULT_CACHE_DIR;
  private filesystemStore?: FilesystemStore;
  private filesystemReady?: Promise<void>;

  constructor(config: OgCacheConfig) {
    this.config = config;

    if (config.type === 'memory') {
      this.cache = new LRUCache<K, V>({
        max: config.max || DEFAULT_MAX,
        ttl: config.ttl || DEFAULT_TTL,
      });
    }

    if (config.type === 'filesystem') {
      this.cacheDir = config.dir || DEFAULT_CACHE_DIR;
      this.filesystemReady = this.initFilesystem();
    }
  }

  /**
   * Builds a stable cache key from a parameter object (SHA-256 hex).
   */
  async generateKey(object: Record<string, unknown>): Promise<string> {
    const sorted = Object.keys(object)
      .sort()
      .map((key) => `${key}=${String(object[key])}`);

    return sha256Hex(sorted.join('|'));
  }

  async get(key: K): Promise<V | undefined> {
    if (this.config.type === 'memory') {
      return this.cache?.get(key);
    }

    if (this.config.type === 'filesystem') {
      await this.ensureFilesystem();
      const data = await this.filesystemStore!.loadFromDisk(this.fsConfig(), key);
      return data as V | undefined;
    }

    return undefined;
  }

  async set(key: K, value: V): Promise<void> {
    if (this.config.type === 'memory') {
      this.cache?.set(key, value);
      return;
    }

    if (this.config.type === 'filesystem') {
      await this.ensureFilesystem();
      await this.filesystemStore!.saveToDisk(this.fsConfig(), key, value);
    }
  }

  async has(key: K): Promise<boolean> {
    if (this.config.type === 'memory') {
      return this.cache?.has(key) || false;
    }

    if (this.config.type === 'filesystem') {
      await this.ensureFilesystem();
      return this.filesystemStore!.hasOnDisk(this.fsConfig(), key);
    }

    return false;
  }

  async clear(): Promise<void> {
    if (this.config.type === 'memory') {
      this.cache?.clear();
      return;
    }

    if (this.config.type === 'filesystem') {
      await this.ensureFilesystem();
      await this.filesystemStore!.clearFilesystem(this.fsConfig());
    }
  }

  private fsConfig() {
    return {
      dir: this.cacheDir,
      ttl: this.config.ttl || DEFAULT_TTL,
    };
  }

  private async initFilesystem(): Promise<void> {
    try {
      this.filesystemStore = await import('./filesystem-store');
      await this.filesystemStore.ensureCacheDirectory(this.cacheDir);
      await this.filesystemStore.cleanExpiredFiles(this.fsConfig());
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `[@ogify/core] Filesystem cache is only supported on Node.js (failed to load node:fs). ` +
          `Use \`cache: { type: 'memory' }\` on Cloudflare Workers / Vercel Edge.\nCause: ${detail}`
      );
    }
  }

  private async ensureFilesystem(): Promise<void> {
    if (!this.filesystemReady) {
      this.filesystemReady = this.initFilesystem();
    }
    await this.filesystemReady;
  }
}
