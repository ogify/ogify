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
    vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' });
    const { detectRuntime } = await import('../src/backends/runtime');
    expect(detectRuntime()).toBe('edge');
  });

  it('detects Vercel Edge via EdgeRuntime', async () => {
    vi.stubGlobal('navigator', undefined);
    vi.stubGlobal('EdgeRuntime', 'edge-runtime');
    // Also clear node-like process for this assertion path when EdgeRuntime is set
    const { detectRuntime } = await import('../src/backends/runtime');
    expect(detectRuntime()).toBe('edge');
  });

  it('detects Node via process.versions.node', async () => {
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
    vi.doUnmock('../src/backends/auto');
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

  it('auto-selects WASM on edge when wasm is provided via createAutoResvg', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' });

    const wasmBackend: OgResvgBackend = {
      render: vi.fn().mockResolvedValue(new Uint8Array([5])),
    };

    vi.doMock('../src/backends/wasm', () => ({
      createWasmResvg: vi.fn().mockResolvedValue(wasmBackend),
    }));

    const { createAutoResvg, resetAutoResvgCache } = await import('../src/backends/auto');
    resetAutoResvgCache();

    const fakeWasm = {} as WebAssembly.Module;
    await expect(createAutoResvg({ wasm: fakeWasm })).resolves.toBe(wasmBackend);
  });

  it('throws a helpful error on edge when WASM cannot be loaded', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' });

    const { createAutoResvg, resetAutoResvgCache } = await import('../src/backends/auto');
    resetAutoResvgCache();

    await expect(createAutoResvg()).rejects.toThrow(/Automatic Resvg selection needs a WASM module/);
    await expect(createAutoResvg()).rejects.toThrow(/index_bg\.wasm/);
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
