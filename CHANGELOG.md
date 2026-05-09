# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-09

### Added

#### `@ogify/core`

- **`scale` option for render quality supersampling** ([`OgTemplateOptions`](./packages/core/src/types.ts))

  A new `scale?: number` option on `renderToImage()` / `renderTemplate()` that improves output image quality by rasterizing the vector SVG at a higher resolution.

  ```ts
  // @2x retina — sharpest text, borders, gradients
  const image = await renderer.renderToImage('og', params, { scale: 2 });

  // Fine-grained float values also supported
  const image = await renderer.renderToImage('og', params, { scale: 1.5 });
  ```

  **How it works:**
  - Satori renders the SVG at the **original** `width × height` (layout and font sizes stay correct)
  - Resvg rasterizes the vector SVG at `width × scale` pixels wide — exploiting the full quality of SVG's vector format
  - Output PNG dimensions are `(width × scale) × (height × scale)`

  | `scale` | Output dimensions | Notes |
  |---------|------------------|-------|
  | `1` *(default)* | 1200 × 630 | No change — fully backward compatible |
  | `1.25` | 1500 × 787 | Mild quality boost |
  | `1.5` | 1800 × 945 | Good quality / size balance |
  | `2` | 2400 × 1260 | **Recommended** — @2x retina |
  | `3` | 3600 × 1890 | @3x ultra |
  | `4` | 4800 × 2520 | Maximum (clamped) |

  **Constraints:**
  - Float values supported (`1.25`, `1.5`, etc.)
  - Values below `1` are clamped to `1`
  - Values above `4` are clamped to `4` (prevents OOM)
  - Templates always receive the original `width`/`height` — fully backward compatible

### Notes

- `scale: 1` (the default) produces identical output to all previous versions. No changes are required for existing consumers.
- Output PNG file size increases proportionally to `scale²` (e.g. `scale: 2` → ~4× larger file).

---

## [1.0.1] - 2026-05-07

### Fixed

- Removed example output images from repository to reduce package size.

---

## [1.0.0] - Initial Release

- `@ogify/core` — core rendering engine (Satori + Resvg pipeline)
- `@ogify/templates` — built-in `basic` template
- Custom font support (Google Fonts, URL, data)
- Emoji rendering (Noto, Twemoji, Fluent, Blobmoji)
- RTL layout support
- In-memory and custom cache adapters
- Next.js, Nuxt, and Remix integration examples
