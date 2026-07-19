import { Buffer } from 'buffer';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { CacheManager } from '../src/utils/cache-manager';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('CacheManager filesystem compatibility', () => {
  it('returns Buffer instances from filesystem cache hits', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ogify-cache-'));
    tempDirs.push(dir);

    const cache = new CacheManager<string, Buffer>({
      type: 'filesystem',
      dir,
    });
    const image = Buffer.from('png-data');

    await cache.set('image', image);
    const cached = await cache.get('image');

    expect(Buffer.isBuffer(cached)).toBe(true);
    expect(cached?.toString()).toBe('png-data');
  });
});
