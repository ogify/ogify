/**
 * Unit tests for cross-platform Resvg backend resolution and auto-selection.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { OgResvgBackend } from '../src/backends/types';

describe('detectRuntime', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('detects Cloudflare Workers via navigator.userAgent', async () => {
    vi.resetModules();
    vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' });
    const { detectRuntime } = await import('../src/backends/runtime');
    expect(detectRuntime()).toBe('edge');
  });

  it('detects Vercel Edge via EdgeRuntime', async () => {
    vi.resetModules();
    vi.stubGlobal('navigator', undefined);
    vi.stubGlobal('EdgeRuntime', 'edge-runtime');
    const { detectRuntime } = await import('../src/backends/runtime');
    expect(detectRuntime()).toBe('edge');
  });

  it('detects Node via process.versions.node', async () => {
    vi.resetModules();
    vi.stubGlobal('navigator', undefined);
    vi.stubGlobal('EdgeRuntime', undefined);
    const { detectRuntime } = await import('../src/backends/runtime');
    expect(detectRuntime()).toBe('node');
  });
});

describe('resolveResvgBackend', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.doUnmock('../src/backends/node');
    vi.doUnmock('../src/backends/wasm');
  });

  it('returns the explicit backend when provided (override wins)', async () => {
    const { resolveResvgBackend } = await import('../src/backends/resolve');
    const backend: OgResvgBackend = {
      render: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    };

    await expect(resolveResvgBackend(backend)).resolves.toBe(backend);
  });

  it('auto-loads the Node backend on Node runtimes when resvg is omitted', async () => {
    const nodeBackend: OgResvgBackend = {
      render: vi.fn().mockResolvedValue(new Uint8Array([9])),
    };

    const { registerAutoBackendFactory, resetAutoResvgCache } =
      await import('../src/backends/auto');
    resetAutoResvgCache();
    registerAutoBackendFactory(() => nodeBackend, 'node');

    const { resolveResvgBackend } = await import('../src/backends/resolve');
    await expect(resolveResvgBackend()).resolves.toBe(nodeBackend);
  });

  it('uses the platform-registered WASM backend on edge', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' });

    const wasmBackend: OgResvgBackend = {
      render: vi.fn().mockResolvedValue(new Uint8Array([5])),
    };
    const { createAutoResvg, registerAutoBackendFactory, resetAutoResvgCache } =
      await import('../src/backends/auto');
    resetAutoResvgCache();
    registerAutoBackendFactory(() => wasmBackend, 'workerd');

    await expect(createAutoResvg()).resolves.toBe(wasmBackend);
  });

  it('throws a helpful error when no platform backend was registered', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' });

    const { createAutoResvg, resetAutoResvgCache } = await import('../src/backends/auto');
    resetAutoResvgCache();

    await expect(createAutoResvg()).rejects.toThrow(/No automatic Resvg backend was registered/);
  });
});

describe('createNodeResvg', () => {
  beforeEach(() => {
    vi.resetModules();
  });

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

describe('createWasmResvg', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('copies PNG bytes and frees WASM allocations deterministically', async () => {
    const imageFree = vi.fn();
    const rendererFree = vi.fn();
    const asPng = vi.fn().mockReturnValue(new Uint8Array([4, 2]));
    const render = vi.fn().mockReturnValue({ asPng, free: imageFree });
    class Resvg {
      render = render;
      free = rendererFree;
    }
    const initWasm = vi.fn().mockResolvedValue(undefined);

    vi.doMock('@resvg/resvg-wasm', () => ({ initWasm, Resvg }));

    const { createWasmResvg } = await import('../src/backends/wasm');
    const wasm = {} as WebAssembly.Module;
    const backend = await createWasmResvg(wasm);
    const result = await backend.render('<svg/>', {
      fitTo: { mode: 'width', value: 1200 },
    });

    expect(result).toEqual(new Uint8Array([4, 2]));
    expect(result).not.toBe(asPng.mock.results[0].value);
    expect(imageFree).toHaveBeenCalledOnce();
    expect(rendererFree).toHaveBeenCalledOnce();
  });
});
