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
    vi.doUnmock('../src/backends/wasm-asset');
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

    vi.doMock('../src/backends/node', () => ({
      createNodeResvg: () => nodeBackend,
    }));

    const { resolveResvgBackend } = await import('../src/backends/resolve');
    await expect(resolveResvgBackend()).resolves.toBe(nodeBackend);
  });

  it('auto-loads WASM from the core asset on edge when resvg is omitted', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' });

    const wasmBackend: OgResvgBackend = {
      render: vi.fn().mockResolvedValue(new Uint8Array([5])),
    };
    const fakeWasm = { __wasm: true } as unknown as WebAssembly.Module;

    vi.doMock('../src/backends/wasm-asset', () => ({
      defaultWasm: fakeWasm,
    }));
    vi.doMock('../src/backends/wasm', () => ({
      createWasmResvg: vi.fn().mockResolvedValue(wasmBackend),
    }));

    const { createAutoResvg, resetAutoResvgCache } = await import('../src/backends/auto');
    resetAutoResvgCache();

    await expect(createAutoResvg()).resolves.toBe(wasmBackend);
  });

  it('uses an explicit wasm override on edge when provided', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' });

    const wasmBackend: OgResvgBackend = {
      render: vi.fn().mockResolvedValue(new Uint8Array([6])),
    };
    const createWasmResvg = vi.fn().mockResolvedValue(wasmBackend);

    vi.doMock('../src/backends/wasm', () => ({ createWasmResvg }));

    const { createAutoResvg, resetAutoResvgCache } = await import('../src/backends/auto');
    resetAutoResvgCache();

    const override = {} as WebAssembly.Module;
    await expect(createAutoResvg({ wasm: override })).resolves.toBe(wasmBackend);
    expect(createWasmResvg).toHaveBeenCalledWith(override);
  });

  it('throws a helpful error on edge when the WASM asset cannot be loaded', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' });

    vi.doMock('../src/backends/wasm-asset', () => ({
      get defaultWasm() {
        throw new Error('wasm missing');
      },
    }));

    const { createAutoResvg, resetAutoResvgCache } = await import('../src/backends/auto');
    resetAutoResvgCache();

    await expect(createAutoResvg()).rejects.toThrow(/Failed to auto-load the WASM Resvg backend/);
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
