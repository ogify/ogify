# Design: Render Scale Factor for Image Quality

**Date:** 2026-05-08  
**Status:** Implemented  
**Package:** `@ogify/core`  

---

## Problem

The default render quality of satori + @resvg/resvg-js is suboptimal. The current pipeline generates an SVG at `1200×630` and rasterizes it at the same 1:1 scale, resulting in:

- Aliased edges on text and borders
- Poor quality on thin strokes (<2px)
- Gradient/shadow edges that appear pixelated
- No super-sampling benefit

**Root cause** — `template.ts`:

```ts
const pngData = await renderAsync(svg, {
  fitTo: {
    mode: 'width',
    value: width, // 1200 → SVG at 1200, rasterize at 1200 = no quality gain
  },
});
```

---

## Solution

Add a `scale` option to `OgTemplateOptions` that enables **vector supersampling**:

1. Satori renders the SVG at the **original** `width × height` (layout and font sizes remain correct)
2. The template renderer receives the **original** `width`/`height` (backward compatible)
3. Resvg rasterizes the **vector SVG** at `width × scale` pixels wide → output PNG is `(width × scale) × (height × scale)`

Since SVG is a vector format, Resvg can rasterize it at any resolution with full quality. Rendering at a higher resolution naturally produces better anti-aliasing, font hinting, and edge sharpness.

**Key insight:** Scaling happens at the **rasterization step** (Resvg), not at the layout step (Satori). This is the correct approach because:
- Satori layout at original dims → font-size/padding values in templates are always correct
- Resvg rasterizes the vector at @Nx → genuine quality improvement with no content distortion

---

## Architecture

### Files Changed

| File | Change |
|------|--------|
| `src/types.ts` | Add `scale?: number` to `OgTemplateOptions` |
| `src/template.ts` | Satori at original dims; Resvg `fitTo` = `width × scale` |
| `test/template.test.ts` | Test cases verifying Satori stays at original, Resvg upscales |

---

## Type Definition

```ts
// src/types.ts — OgTemplateOptions
/**
 * Render scale factor for supersampling.
 *
 * Satori renders the SVG at the original `width × height`. Resvg then
 * rasterizes the vector SVG at `(width × scale) × (height × scale)`.
 *
 * The template renderer always receives the original width/height —
 * scale is transparent to templates and fully backward compatible.
 *
 * Supports float values (e.g. `1.25`, `1.5`, `2`).
 * Values below `1` are clamped to `1`. Values above `4` are clamped to `4`.
 *
 * Output PNG dimensions = (width × scale) × (height × scale):
 * - `1`    → 1200×630   (no change)
 * - `1.25` → 1500×787
 * - `1.5`  → 1800×945
 * - `2`    → 2400×1260  (@2x retina)
 * - `3`    → 3600×1890  (@3x ultra)
 *
 * @default 1
 */
scale?: number;
```

---

## Rendering Logic

```ts
// src/template.ts

// Clamp to [1, 4]. Float values supported (e.g. 1.25, 1.5).
const scale = Math.max(1, Math.min(4, options?.scale ?? 1));

// Satori renders at ORIGINAL dimensions — template font sizes stay correct
const svg = await satori(element, {
  width,  // original: e.g. 1200
  height, // original: e.g. 630
  ...
});

// Resvg rasterizes the vector SVG at scaled resolution
const pngData = await renderAsync(svg, {
  fitTo: {
    mode: 'width',
    value: Math.round(width * scale), // e.g. 2400 for scale=2, 1500 for scale=1.25
  },
});
```

---

## Behavior Table

| `scale` | Satori SVG | PNG output | Notes |
|---------|-----------|------------|-------|
| `1` (default) | 1200×630 | 1200×630 | No change |
| `1.25` | 1200×630 | 1500×787 | Mild quality boost |
| `1.5` | 1200×630 | 1800×945 | Good quality/size balance |
| `2` | 1200×630 | 2400×1260 | @2x retina — recommended |
| `3` | 1200×630 | 3600×1890 | @3x ultra |
| `4` | 1200×630 | 4800×2520 | Maximum (clamped) |

**Satori SVG is always 1200×630** — only the Resvg rasterization output changes.

---

## Backward Compatibility

- `scale` defaults to `1` → zero behavior change for existing consumers
- Template renderer props (`width`, `height`) are unchanged
- Cache key already includes all `options` fields via spread in `renderToImage`
- No breaking changes to any exported types or functions

---

## Performance

| `scale` | Render time increase | Output PNG size |
|---------|---------------------|-----------------|
| `1` | baseline | ~80KB |
| `1.5` | ~15–25% | ~180KB |
| `2` | ~30–50% | ~320KB |
| `3` | ~80–120% | ~700KB |
| `4` | ~200%+ | ~1.3MB |

**Recommended: `scale: 2`** cho best quality/performance tradeoff.

---

## Edge Cases

- `scale < 1` → clamped to `1`
- `scale > 4` → clamped to `4`
- Float values (`1.25`, `1.5`) → supported, `Math.round()` applied only to final pixel value
- `undefined` / `null` → treated as `1`

---

## Test Cases

1. `scale: 1` (default) → Satori at 1200×630, Resvg fitTo 1200
2. `scale: 2` → Satori still at 1200×630, Resvg fitTo 2400
3. `scale: 3` → Satori still at 1200×630, Resvg fitTo 3600
4. Template renderer always receives original `width`/`height` regardless of scale
5. `scale: 0` → clamped to 1, Satori at 1200, Resvg fitTo 1200
6. `scale: 5` → clamped to 4, Satori at 1200, Resvg fitTo 4800

---

## Out of Scope

- JPEG output
- Quality presets (`quality: 'high'`)
- Per-template default scale
- Downsampling back to original dimensions (deferred — requires image processing library)
