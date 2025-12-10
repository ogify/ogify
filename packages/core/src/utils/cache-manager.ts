/**
 * Cache management utilities using LRU cache strategy.
 *
 * This module provides a unified caching interface that supports:
 * - Memory-based caching with LRU eviction
 * - Filesystem-based persistent caching
 * - Configurable TTL and maximum cache size
 */

import { LRUCache } from 'lru-cache';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import type { OgCacheConfig } from '../types';

/**
 * Default cache configuration values.
 */
const DEFAULT_TTL = 1000 * 60 * 60 * 24 * 7; // 1 day in milliseconds
const DEFAULT_MAX = 100; // Maximum number of cached items
const DEFAULT_CACHE_DIR = '.ogify-cache';

/**
 * Cache manager that wraps LRUCache with support for memory and filesystem storage.
 *
 * **Memory Cache:**
 * - Fast in-memory storage
 * - Automatic LRU eviction when max size is reached
 * - Data lost when process exits
 *
 * **Filesystem Cache:**
 * - Persistent storage on disk
 * - Survives process restarts
 * - Slower than memory cache due to I/O operations
 * - Automatic directory creation
 */
export class CacheManager<K extends string, V extends Buffer> {
  private cache?: LRUCache<K, V>;
  private config: OgCacheConfig;
  private cacheDir: string = DEFAULT_CACHE_DIR;

  /**
   * Creates a new CacheManager instance.
   *
   * @param config - Cache configuration (memory or filesystem)
   */
  constructor(config: OgCacheConfig) {
    this.config = config;

    // Initialize LRU cache with configuration
    if (config.type === 'memory') {
      this.cache = new LRUCache<K, V>({
        max: config.max || DEFAULT_MAX,
        ttl: config.ttl || DEFAULT_TTL,
      });
    }

    // Set up filesystem cache directory if needed
    if (config.type === 'filesystem') {
      this.cacheDir = config.dir || DEFAULT_CACHE_DIR;

      // Ensure cache directory exists
      this.ensureCacheDirectory();

      // Clean up expired files asynchronously
      this.cleanExpiredFiles().catch((err) => {
        console.warn('Failed to clean expired cache files:', err);
      });
    }
  }

  // eslint-disable-next-line
  generateKey(object: Record<string, any>): string {
    const sorted = Object.keys(object)
      .sort()
      .map((key) => `${key}=${object[key]}`);

    return crypto.createHash('md5').update(sorted.join('|')).digest('hex');
  }

  /**
   * Retrieves a value from the cache.
   *
   * For filesystem cache, attempts to load from disk if not in memory.
   *
   * @param key - Cache key
   * @returns Cached buffer or undefined if not found
   */
  async get(key: K): Promise<V | undefined> {
    // Try memory cache first
    if (this.config.type === 'memory') {
      return this.cache?.get(key);
    }

    // For filesystem cache, try loading from disk
    if (this.config.type === 'filesystem') {
      return this.loadFromDisk(key);
    }

    return undefined;
  }

  /**
   * Stores a value in the cache.
   *
   * For filesystem cache, also persists to disk.
   *
   * @param key - Cache key
   * @param value - Buffer to cache
   */
  async set(key: K, value: V): Promise<void> {
    // Store in memory cache
    if (this.config.type === 'memory') {
      this.cache?.set(key, value);
    }

    // For filesystem cache, persist to disk
    if (this.config.type === 'filesystem') {
      await this.saveToDisk(key, value);
    }
  }

  /**
   * Checks if a key exists in the cache.
   *
   * @param key - Cache key
   * @returns true if the key exists and is not expired
   */
  async has(key: K): Promise<boolean> {
    if (this.config.type === 'memory') {
      return this.cache?.has(key) || false;
    }

    if (this.config.type === 'filesystem') {
      try {
        await fs.promises.access(path.join(this.cacheDir, this.getFilename(key)));
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Clears all cached items.
   *
   * For filesystem cache, also removes all files from disk.
   */
  async clear(): Promise<void> {
    if (this.config.type === 'memory') {
      this.cache?.clear();
    }

    if (this.config.type === 'filesystem') {
      await this.clearFilesystem();
    }
  }

  /**
   * Ensures the cache directory exists.
   * Creates it if it doesn't exist.
   */
  private ensureCacheDirectory(): void {
    if (!this.cacheDir) return;

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generates a safe filename from a cache key.
   *
   * Uses SHA-256 hash to avoid filesystem issues with special characters.
   *
   * @param key - Cache key
   * @returns Safe filename
   */
  private getFilename(key: K): string {
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    return `${hash}.cache`;
  }

  /**
   * Loads a cached item from disk.
   *
   * @param key - Cache key
   * @returns Cached buffer or undefined if not found or expired
   */
  private async loadFromDisk(key: K): Promise<V | undefined> {
    if (this.config.type !== 'filesystem') return undefined;

    const filename = this.getFilename(key);
    const filepath = path.join(this.cacheDir, filename);

    try {
      // Check if file exists
      try {
        await fs.promises.access(filepath);
      } catch {
        return undefined;
      }

      // Check if expired (based on file modification time)
      const stats = await fs.promises.stat(filepath);
      const age = Date.now() - stats.mtimeMs;
      const ttl = this.config.ttl || DEFAULT_TTL;

      if (age > ttl) {
        // Expired, delete the file
        await fs.promises.unlink(filepath).catch(() => {});
        return undefined;
      }

      // Read the cached data
      const data = await fs.promises.readFile(filepath);

      // Store in memory cache for faster subsequent access
      // Note: This might trigger dispose if cache is full, removing another file.
      this.cache?.set(key, data as V);

      return data as V;
    } catch (error) {
      // If there's any error reading the file, return undefined
      return undefined;
    }
  }

  /**
   * Saves a cached item to disk.
   *
   * @param key - Cache key
   * @param value - Buffer to save
   */
  private async saveToDisk(key: K, value: Buffer): Promise<void> {
    if (this.config.type !== 'filesystem') return;

    const filename = this.getFilename(key);
    const filepath = path.join(this.cacheDir, filename);

    try {
      await fs.promises.writeFile(filepath, value);
    } catch (error) {
      // Silently fail if we can't write to disk
      // The memory cache will still work
    }
  }

  /**
   * Loads all cached items from filesystem into memory on initialization.
   */
  private async cleanExpiredFiles(): Promise<void> {
    if (this.config.type !== 'filesystem') return;

    try {
      const files = await fs.promises.readdir(this.cacheDir);

      for (const file of files) {
        if (!file.endsWith('.cache')) continue;

        const filepath = path.join(this.cacheDir, file);
        try {
          const stats = await fs.promises.stat(filepath);
          const age = Date.now() - stats.mtimeMs;
          const ttl = this.config.ttl || DEFAULT_TTL;

          // Remove expired files
          if (age > ttl) {
            await fs.promises.unlink(filepath).catch(() => {});
          }
        } catch {
          // Ignore individual file errors
        }
      }
    } catch (error) {
      // If we can't read the directory, just continue
      // The cache will work in memory-only mode
    }
  }

  /**
   * Clears all files from the filesystem cache directory.
   */
  private async clearFilesystem(): Promise<void> {
    if (this.config.type !== 'filesystem') return;

    const cacheDir = this.cacheDir;

    try {
      const files = await fs.promises.readdir(cacheDir);

      const unlinkPromises = files.map(async (file) => {
        if (!file.endsWith('.cache')) return;
        const filepath = path.join(cacheDir, file);
        await fs.promises.unlink(filepath).catch(() => {});
      });

      await Promise.all(unlinkPromises);
    } catch (error) {
      // Silently fail if we can't clear the directory
    }
  }
}
