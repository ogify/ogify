# Design: Render Scale Factor for Image Quality

**Date:** 2026-05-08  
**Status:** Approved  
**Package:** `@ogify/core`  

---

## Problem

The default render quality of satori + @resvg/resvg-js is suboptimal. The current pipeline generates an SVG at `1200×630` and rasterizes it at the same 1:1 scale, resulting in:

- Aliased edges on text and borders
- Poor quality on thin strokes (<2px)
- Gradient/shadow edges that appear pixelated
- No super-sampling benefit

**Root cause** — `template.ts` line 117-122:

```ts
const pngData = await renderAsync(svg, {
  fitTo: {
    mode: 'width',
    value: width, // 1200 → SVG at 1200, rasterize at 1200 = no upscale
  },
});
```

---

## Solution

Add a `scale` option to `OgTemplateOptions` that enables **supersampling**:

1. Satori renders the SVG at `width * scale` × `height * scale`
2. The template renderer still receives the **original** `width`/`height` (backward compatible)
3. Resvg downsamples via `fitTo: { mode: 'width', value: width }` — back to original dimensions
4. Output PNG is always `1200×630` regardless of scale

---

## Architecture

### Files Changed

| File | Change |
|------|--------|
| `src/types.ts` | Add `scale?: number` to `OgTemplateOptions` |
| `src/template.ts` | Apply scale to Satori dimensions; Resvg fitTo always targets original `width` |
| `test/template.test.ts` | Add test cases for scale=1, scale=2, scale=3 |

---

## Type Definition

Add `scale?: number` to `OgTemplateOptions` in `src/types.ts`:

```ts
/**
 * Render scale factor for supersampling.
 * Satori renders at (width × scale) × (height × scale),
 * Resvg downsamples to original (width × height).
 * Template renderer always receives original width/height.
 * @default 1
 */
scale?: number;
```

---

## Rendering Logic (src/template.ts)

```ts
const scale = Math.max(1, Math.min(4, Math.round(options?.scale ?? 1)));
const renderWidth = width * scale;
const renderHeight = height * scale;

// Template renderer receives ORIGINAL dimensions
const htmlString = await template.renderer({ params, width, height, ...options });

// Satori at HIGH resolution
const svg = await satori(element, {
  width: renderWidth,   // 2400 when scale=2
  height: renderHeight, // 1260 when scale=2
  ...
});

// Resvg downsample to ORIGINAL
const pngData = await renderAsync(svg, {
  fitTo: { mode: 'width', value: width }, // always 1200
});
```

---

## Behavior Table

| `scale` | Satori SVG | PNG output |
|---------|-----------|------------|
| `1` | 1200×630 | 1200×630 |
| `2` | 2400×1260 | 1200×630 |
| `3` | 3600×1890 | 1200×630 |
| `4` | 4800×2520 | 1200×630 |

---

## Backward Compatibility

- `scale` defaults to `1` → zero behavior change
- Template renderer props unchanged
- Cache key auto-includes `scale` via existing `...options` spread
- No breaking changes

---

## Performance

| `scale` | Render time increase | Memory |
|---------|---------------------|--------|
| `1` | baseline | baseline |
| `2` | ~30–50% | ~4× SVG |
| `3` | ~80–120% | ~9× SVG |
| `4` | ~200%+ | ~16× SVG |

**Recommended: `scale: 2`** cho best quality/performance tradeoff.

---

## Edge Cases

- `scale < 1` → clamped to `1`
- Non-integer → `Math.round()` then clamp
- `undefined` / `null` → treated as `1`
- `scale > 4` → clamped to `4`

---

## Test Cases

1. `scale: 1` → PNG dimensions = original
2. `scale: 2` → PNG dimensions still = original (not doubled)
3. `scale: 3` → PNG dimensions still = original
4. `scale: 0` (edge case) → clamped to 1
5. `scale: 5` (edge case) → clamped to 4
6. No `scale` → same as `scale: 1`

---

## Out of Scope

- JPEG output
- Quality presets (`quality: 'high'`)
- Per-template default scale
