/**
 * Filesystem-backed cache store (Node.js only).
 *
 * Dynamically imported by CacheManager so edge/worker bundles that only use
 * memory cache do not need to resolve `node:fs`.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { sha256Hex } from './hash';

export type FilesystemStoreConfig = {
  dir: string;
  ttl: number;
};

async function filenameForKey(key: string): Promise<string> {
  const hash = await sha256Hex(key);
  return `${hash}.cache`;
}

export async function ensureCacheDirectory(dir: string): Promise<void> {
  await fs.promises.mkdir(dir, { recursive: true });
}

export async function loadFromDisk(
  config: FilesystemStoreConfig,
  key: string
): Promise<Uint8Array | undefined> {
  const filepath = path.join(config.dir, await filenameForKey(key));

  try {
    await fs.promises.access(filepath);
  } catch {
    return undefined;
  }

  try {
    const stats = await fs.promises.stat(filepath);
    const age = Date.now() - stats.mtimeMs;

    if (age > config.ttl) {
      await fs.promises.unlink(filepath).catch(() => {});
      return undefined;
    }

    const data = await fs.promises.readFile(filepath);
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  } catch {
    return undefined;
  }
}

export async function saveToDisk(
  config: FilesystemStoreConfig,
  key: string,
  value: Uint8Array
): Promise<void> {
  const filepath = path.join(config.dir, await filenameForKey(key));

  try {
    await fs.promises.writeFile(filepath, value);
  } catch {
    // Memory cache remains usable if disk write fails
  }
}

export async function hasOnDisk(config: FilesystemStoreConfig, key: string): Promise<boolean> {
  const filepath = path.join(config.dir, await filenameForKey(key));
  try {
    await fs.promises.access(filepath);
    return true;
  } catch {
    return false;
  }
}

export async function cleanExpiredFiles(config: FilesystemStoreConfig): Promise<void> {
  try {
    const files = await fs.promises.readdir(config.dir);

    await Promise.all(
      files.map(async (file) => {
        if (!file.endsWith('.cache')) return;

        const filepath = path.join(config.dir, file);
        try {
          const stats = await fs.promises.stat(filepath);
          const age = Date.now() - stats.mtimeMs;
          if (age > config.ttl) {
            await fs.promises.unlink(filepath).catch(() => {});
          }
        } catch {
          // Ignore per-file errors
        }
      })
    );
  } catch {
    // Directory may not exist yet
  }
}

export async function clearFilesystem(config: FilesystemStoreConfig): Promise<void> {
  try {
    const files = await fs.promises.readdir(config.dir);

    await Promise.all(
      files.map(async (file) => {
        if (!file.endsWith('.cache')) return;
        await fs.promises.unlink(path.join(config.dir, file)).catch(() => {});
      })
    );
  } catch {
    // Ignore clear failures
  }
}
