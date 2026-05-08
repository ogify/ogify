# Render Scale Factor Implementation Plan

> **Status: COMPLETED** — All tasks implemented. This document reflects the final as-built state.

**Goal:** Add a `scale` option to `OgTemplateOptions` that enables supersampling — Satori renders the SVG at original `width × height`, Resvg rasterizes the vector SVG at `width × scale` pixels wide. Output PNG is `(width × scale) × (height × scale)`.

**Architecture:** Satori always renders at original dimensions (font sizes/layout stay correct). Scale is applied only at the Resvg rasterization step, exploiting the fact that SVG is a vector format and can be rasterized at any resolution. Float scale values (1.25, 1.5) are supported. Scale is clamped to `[1, 4]`.

**Tech Stack:** TypeScript, `satori` (HTML→SVG), `@resvg/resvg-js` (SVG→PNG rasterization), `vitest` (testing)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/core/src/types.ts` | Modified ✅ | `scale?: number` in `OgTemplateOptions` |
| `packages/core/src/template.ts` | Modified ✅ | Satori at original dims; Resvg `fitTo = width × scale` |
| `packages/core/test/template.test.ts` | Modified ✅ | Tests verifying Satori stays original, Resvg upscales |

---

## Task 1: Add `scale` type to `OgTemplateOptions` ✅

**Files:**
- Modify: `packages/core/src/types.ts`

- [x] **Step 1: Add `scale` field to `OgTemplateOptions`**

  ```ts
  export type OgTemplateOptions = {
    fonts?: OgFontConfig[];
    emojiProvider?: OgEmojiProvider;
    width?: number;
    height?: number;
    isRTL?: boolean;

    /**
     * Render scale factor for supersampling.
     *
     * Satori renders the SVG at the original `width × height`. Resvg then
     * rasterizes the vector SVG at `(width × scale) × (height × scale)`.
     *
     * Supports float values (e.g. `1.25`, `1.5`, `2`).
     * Values below `1` are clamped to `1`. Values above `4` are clamped to `4`.
     *
     * Output PNG dimensions = (width × scale) × (height × scale).
     *
     * @default 1
     */
    scale?: number;
  };
  ```

- [x] **Step 2: Verify types compile**

  ```bash
  cd packages/core && pnpm run build
  ```

- [x] **Step 3: Commit**

  ```bash
  git commit -m "feat(@ogify/core): add scale option to OgTemplateOptions"
  ```

---

## Task 2: Write tests for scale behavior ✅

**Files:**
- Modify: `packages/core/test/template.test.ts`

- [x] **Step 1: Add `renderAsync` import**

  ```ts
  import { renderAsync } from '@resvg/resvg-js';
  ```

- [x] **Step 2: Add scale test suite**

  ```ts
  describe('scale option', () => {
    it('should use default scale=1 — Satori at original, Resvg fitTo original', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' });

      expect(satori).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        width: 1200,
        height: 630,
      }));
      expect(vi.mocked(renderAsync)).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        fitTo: { mode: 'width', value: 1200 },
      }));
    });

    it('should keep Satori at original dims and upscale Resvg fitTo when scale=2', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 2 });

      expect(satori).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        width: 1200, // original, NOT 2400
        height: 630,
      }));
      expect(vi.mocked(renderAsync)).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        fitTo: { mode: 'width', value: 2400 }, // 1200 * 2
      }));
    });

    it('should keep Satori at original dims and upscale Resvg fitTo when scale=3', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 3 });

      expect(satori).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        width: 1200,
        height: 630,
      }));
      expect(vi.mocked(renderAsync)).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        fitTo: { mode: 'width', value: 3600 }, // 1200 * 3
      }));
    });

    it('should pass original width/height to template renderer regardless of scale', async () => {
      const rendererSpy = vi.fn().mockReturnValue('<div></div>');
      await renderTemplate({ ...mockTemplate, renderer: rendererSpy }, { text: 'Hello' }, {
        width: 1200, height: 630, scale: 3,
      });

      expect(rendererSpy).toHaveBeenCalledWith(expect.objectContaining({
        width: 1200, // NOT 3600
        height: 630, // NOT 1890
      }));
    });

    it('should clamp scale=0 to 1', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 0 });

      expect(vi.mocked(renderAsync)).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        fitTo: { mode: 'width', value: 1200 },
      }));
    });

    it('should clamp scale=5 to 4', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 5 });

      expect(vi.mocked(renderAsync)).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        fitTo: { mode: 'width', value: 4800 }, // 1200 * 4
      }));
    });
  });
  ```

---

## Task 3: Implement scale in `renderTemplate` ✅

**Files:**
- Modify: `packages/core/src/template.ts`

- [x] **Step 1: Implement correct scale logic**

  ```ts
  // Clamp to [1, 4]. Float values supported (1.25, 1.5, etc.).
  const scale = Math.max(1, Math.min(4, options?.scale ?? 1));

  // Satori renders at ORIGINAL dimensions — font sizes and layout stay correct
  const svg = await satori(element as any, {
    width,  // original (e.g. 1200) — never scaled
    height, // original (e.g. 630)
    fonts: satoriFonts,
    embedFont: true,
    loadAdditionalAsset: async (code, segment) => loadAdditionalAsset({ code, segment, fonts, emojiProvider }),
  });

  // Resvg rasterizes the vector SVG at (width × scale) pixels wide.
  // SVG is vector — any output resolution gives full quality.
  const pngData = await renderAsync(svg, {
    fitTo: {
      mode: 'width',
      value: Math.round(width * scale), // e.g. 2400 for scale=2, 1500 for scale=1.25
    },
  });
  ```

- [x] **Step 2: Commit**

  ```bash
  git commit -m "fix(@ogify/core): correct scale supersampling — Satori at original dims, Resvg upscales vector SVG"
  ```

---

## Task 4: Final Verification ✅

- [x] Build passes: `pnpm run build`
- [x] `scale` exported via public API: visible in `dist/index.d.ts`
- [x] Satori always at original dims in implementation
- [x] Resvg `fitTo` = `width × scale`

---

## Usage

```ts
// Default (scale: 1) — no change, 1200×630 output
const image = await renderer.renderToImage('og', params);

// Mild quality boost (scale: 1.25) — 1500×787 output
const image = await renderer.renderToImage('og', params, { scale: 1.25 });

// Good balance (scale: 1.5) — 1800×945 output
const image = await renderer.renderToImage('og', params, { scale: 1.5 });

// @2x retina — recommended (scale: 2) — 2400×1260 output
const image = await renderer.renderToImage('og', params, { scale: 2 });

// @3x ultra (scale: 3) — 3600×1890 output
const image = await renderer.renderToImage('og', params, { scale: 3 });
```
