# Render Scale Factor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `scale` option to `OgTemplateOptions` that enables supersampling — Satori renders the SVG at `width * scale` × `height * scale`, then Resvg downsamples back to original `width × height`. Output PNG dimensions are unchanged; only quality improves.

**Architecture:** Scale is applied solely inside `renderTemplate()` — the template renderer function always receives the original `width`/`height` (backward compatible). The scale factor is clamped to `[1, 4]` to prevent OOM. Cache key already includes `options`, so scale-differentiated cache works automatically.

**Tech Stack:** TypeScript, `satori` (HTML→SVG), `@resvg/resvg-js` (SVG→PNG), `vitest` (testing)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/core/src/types.ts` | Modify | Add `scale?: number` to `OgTemplateOptions` |
| `packages/core/src/template.ts` | Modify | Clamp scale, apply to Satori dims, keep Resvg target at original width |
| `packages/core/test/template.test.ts` | Modify | Add 6 new test cases covering scale behavior and edge cases |

---

## Task 1: Add `scale` type to `OgTemplateOptions`

**Files:**
- Modify: `packages/core/src/types.ts:133-147`

- [ ] **Step 1: Add `scale` field to `OgTemplateOptions`**

  Open `packages/core/src/types.ts`. Find `OgTemplateOptions` (lines 133–147). Add `scale` before the closing brace:

  ```ts
  export type OgTemplateOptions = {
    /** Custom fonts to use in this template */
    fonts?: OgFontConfig[];

    /** Optional emoji provider to use in this template */
    emojiProvider?: OgEmojiProvider;

    /** Optional custom width in pixels (default: 1200) */
    width?: number;

    /** Optional custom height in pixels (default: 630) */
    height?: number;

    isRTL?: boolean;

    /**
     * Render scale factor for supersampling.
     *
     * Satori renders the internal SVG at `(width × scale) × (height × scale)`,
     * then Resvg downsamples the PNG back to the original `width × height`.
     *
     * The template renderer always receives the **original** width/height —
     * scale is an implementation detail of the rendering engine and is fully
     * backward compatible.
     *
     * Use this to improve sharpness of text, borders, and gradients without
     * changing the output image dimensions.
     *
     * - `1` — no supersampling (current behavior, default)
     * - `2` — recommended: 4× pixel density, best quality/performance balance
     * - `3` — ultra quality (slower, higher memory usage)
     * - `4` — maximum allowed (clamped to prevent OOM)
     *
     * Values outside `[1, 4]` are clamped. Non-integers are rounded.
     *
     * @default 1
     */
    scale?: number;
  };
  ```

- [ ] **Step 2: Verify types compile**

  ```bash
  cd packages/core && pnpm run lint
  ```

  Expected: No TypeScript errors.

- [ ] **Step 3: Commit the type change**

  ```bash
  git add packages/core/src/types.ts
  git commit -m "feat(@ogify/core): add scale option to OgTemplateOptions"
  ```

---

## Task 2: Write failing tests for scale behavior

**Files:**
- Modify: `packages/core/test/template.test.ts`

- [ ] **Step 1: Add import for renderAsync mock**

  After the existing imports at the top of `packages/core/test/template.test.ts` (around line 29–31), add:

  ```ts
  import { renderAsync } from '@resvg/resvg-js';
  ```

- [ ] **Step 2: Add all 6 scale test cases**

  Append the following `describe` block inside the outer `describe('renderTemplate', ...)`, after the last existing `it(...)` block:

  ```ts
  describe('scale option', () => {
    it('should use default scale=1 when scale is not provided', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' });

      expect(satori).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 1200,
          height: 630,
        })
      );
      expect(vi.mocked(renderAsync)).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fitTo: { mode: 'width', value: 1200 },
        })
      );
    });

    it('should render Satori at 2x but keep Resvg target at original width when scale=2', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 2 });

      expect(satori).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 2400,  // 1200 * 2
          height: 1260, // 630 * 2
        })
      );
      expect(vi.mocked(renderAsync)).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fitTo: { mode: 'width', value: 1200 }, // always original
        })
      );
    });

    it('should render Satori at 3x but keep Resvg target at original width when scale=3', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 3 });

      expect(satori).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 3600,  // 1200 * 3
          height: 1890, // 630 * 3
        })
      );
      expect(vi.mocked(renderAsync)).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fitTo: { mode: 'width', value: 1200 },
        })
      );
    });

    it('should pass original width/height to template renderer regardless of scale', async () => {
      const rendererSpy = vi.fn().mockReturnValue('<div></div>');
      const templateWithSpy = { ...mockTemplate, renderer: rendererSpy };

      await renderTemplate(templateWithSpy, { text: 'Hello' }, { width: 1200, height: 630, scale: 3 });

      expect(rendererSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 1200, // original, NOT 3600
          height: 630, // original, NOT 1890
        })
      );
    });

    it('should clamp scale=0 to 1 (no crash, behaves as scale=1)', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 0 });

      expect(satori).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 1200, // 1200 * 1 (clamped from 0)
          height: 630,
        })
      );
    });

    it('should clamp scale=5 to 4 (max allowed)', async () => {
      await renderTemplate(mockTemplate, { text: 'Hello' }, { scale: 5 });

      expect(satori).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 4800,  // 1200 * 4 (clamped from 5)
          height: 2520, // 630 * 4 (clamped from 5)
        })
      );
    });
  });
  ```

- [ ] **Step 3: Run tests to verify the new tests fail**

  ```bash
  cd packages/core && pnpm run test
  ```

  Expected: The 6 new scale tests FAIL. All existing tests still PASS.

- [ ] **Step 4: Commit the failing tests**

  ```bash
  git add packages/core/test/template.test.ts
  git commit -m "test(@ogify/core): add failing tests for scale supersampling option"
  ```

---

## Task 3: Implement scale in `renderTemplate`

**Files:**
- Modify: `packages/core/src/template.ts:60-127`

- [ ] **Step 1: Replace the body of `renderTemplate` with scale-aware implementation**

  Open `packages/core/src/template.ts`. Replace the entire `renderTemplate` function body (from the `const width = ...` line through `return pngData.asPng();`):

  ```ts
  export async function renderTemplate<TParams = OgTemplateParams>(
    template: OgTemplate<TParams>,
    params: TParams,
    options?: OgTemplateOptions
  ): Promise<Buffer> {
    const width = options?.width || DEFAULT_WIDTH;
    const height = options?.height || DEFAULT_HEIGHT;
    const fonts = options?.fonts?.length ? options.fonts : template.fonts;
    const emojiProvider = options?.emojiProvider || template.emojiProvider || 'noto';

    // Clamp scale to safe integer range [1, 4] to prevent OOM.
    // Non-integers are rounded first, then clamped.
    const scale = Math.max(1, Math.min(4, Math.round(options?.scale ?? 1)));

    // Internal render dimensions used by Satori (scaled up for supersampling).
    // Template renderer always receives the ORIGINAL width/height (backward compatible).
    const renderWidth = width * scale;
    const renderHeight = height * scale;

    // Step 1: Load all fonts specified in the template
    const satoriFonts: SatoriOptions['fonts'] = await loadFonts(fonts);

    // Step 2: Generate HTML string from the template function.
    // IMPORTANT: pass original width/height — template must NOT be aware of scale.
    const htmlString = await template.renderer({
      params: typeof params === 'function' ? await params() : params,
      ...options,
      width,  // override any scaled value from options spread
      height, // override any scaled value from options spread
    });

    // Step 3: Convert HTML string to React-like element tree
    const element = html(htmlString);

    // Step 4: Render the element tree to SVG using Satori at high resolution.
    // When scale > 1, Satori computes layout at (renderWidth × renderHeight),
    // producing a higher-fidelity SVG before rasterization.
    // eslint-disable-next-line
    const svg = await satori(element as any, {
      width: renderWidth,   // e.g. 2400 when scale=2
      height: renderHeight, // e.g. 1260 when scale=2
      fonts: satoriFonts,
      embedFont: true,
      loadAdditionalAsset: async (code: string, segment: string) => {
        return loadAdditionalAsset({
          code,
          segment,
          fonts,
          emojiProvider,
        });
      },
    });

    // Step 5: Convert SVG to PNG using Resvg.
    // fitTo targets the ORIGINAL width — Resvg downsamples the high-res SVG
    // to the intended output dimensions, applying anti-aliasing in the process.
    const pngData = await renderAsync(svg, {
      fitTo: {
        mode: 'width',
        value: width, // always original width (e.g. 1200), never scaled
      },
    });

    // Step 6: Convert Uint8Array to Node.js Buffer
    return pngData.asPng();
  }
  ```

- [ ] **Step 2: Run tests to verify all pass**

  ```bash
  cd packages/core && pnpm run test
  ```

  Expected: **All tests PASS**, including the 6 new scale tests.

- [ ] **Step 3: Commit the implementation**

  ```bash
  git add packages/core/src/template.ts
  git commit -m "feat(@ogify/core): implement render scale supersampling in renderTemplate"
  ```

---

## Task 4: Final verification

- [ ] **Step 1: Run full test suite**

  ```bash
  cd packages/core && pnpm run test
  ```

  Expected: All tests pass, 0 failures.

- [ ] **Step 2: Type-check the entire package**

  ```bash
  cd packages/core && pnpm run lint
  ```

  Expected: No TypeScript errors.

- [ ] **Step 3: Verify `scale` is exported via the public API**

  ```bash
  grep -n "scale" packages/core/src/types.ts
  ```

  Expected: Line with `scale?: number;` is present.

- [ ] **Step 4: Final commit**

  ```bash
  git add -A
  git commit -m "chore(@ogify/core): finalize scale supersampling feature"
  ```

---

## Usage After Implementation

```ts
// Default (scale: 1) — current behavior, no change
const image = await renderer.renderToImage('og', params);

// High quality (scale: 2) — recommended
const image = await renderer.renderToImage('og', params, { scale: 2 });

// Ultra quality (scale: 3)
const image = await renderer.renderToImage('og', params, { scale: 3 });

// Combined with custom dimensions
const image = await renderer.renderToImage('og', params, {
  width: 1200,
  height: 630,
  scale: 2,
});
```
