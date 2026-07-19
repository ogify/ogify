/**
 * Unit tests for cross-platform Resvg backend resolution.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { OgResvgBackend } from '../src/backends/types';

describe('resolveResvgBackend', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.doUnmock('../src/backends/node');
  });

  it('returns the explicit backend when provided', async () => {
    const { resolveResvgBackend } = await import('../src/backends/resolve');
    const backend: OgResvgBackend = {
      render: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    };

    await expect(resolveResvgBackend(backend)).resolves.toBe(backend);
  });

  it('falls back to the Node backend on Node runtimes', async () => {
    const nodeBackend: OgResvgBackend = {
      render: vi.fn().mockResolvedValue(new Uint8Array([9])),
    };

    vi.doMock('../src/backends/node', () => ({
      createNodeResvg: () => nodeBackend,
    }));

    const { resolveResvgBackend } = await import('../src/backends/resolve');
    await expect(resolveResvgBackend()).resolves.toBe(nodeBackend);
  });

  it('throws a helpful error when no backend is set outside Node', async () => {
    const originalProcess = globalThis.process;
    // Simulate a Worker-like environment without process.versions.node
    vi.stubGlobal('process', { ...originalProcess, versions: {} });

    const { resolveResvgBackend } = await import('../src/backends/resolve');

    await expect(resolveResvgBackend()).rejects.toThrow(/No Resvg backend configured/);
    await expect(resolveResvgBackend()).rejects.toThrow(/@ogify\/core\/wasm/);
  });
});

describe('createNodeResvg', () => {
  it('delegates to @resvg/resvg-js renderAsync', async () => {
    const asPng = vi.fn().mockReturnValue(new Uint8Array([7, 8]));
    const renderAsync = vi.fn().mockResolvedValue({ asPng });

    vi.doMock('@resvg/resvg-js', () => ({ renderAsync }));

    const { createNodeResvg } = await import('../src/backends/node');
    const backend = createNodeResvg();
    const result = await backend.render('<svg/>', {
      fitTo: { mode: 'width', value: 1200 },
    });

    expect(renderAsync).toHaveBeenCalledWith('<svg/>', {
      fitTo: { mode: 'width', value: 1200 },
    });
    expect(result).toEqual(new Uint8Array([7, 8]));
  });
});
