# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### `@ogify/core`

- **Cross-platform Resvg backends** — pluggable SVG → PNG rasterization:
  - `@ogify/core/node` → `createNodeResvg()` using `@resvg/resvg-js` (Node.js / Vercel Serverless)
  - `@ogify/core/wasm` → `createWasmResvg(wasm)` using `@resvg/resvg-wasm` (Cloudflare Workers / Vercel Edge)
  - **`createAutoResvg()`** — runtime detection (Node → native, Edge/Workers → WASM)
- **`resvg` option** on `createRenderer` / `renderTemplate` / `OgTemplateOptions` to inject a backend
- Automatic selection when `resvg` is omitted (`createAutoResvg()` under the hood)

### Changed

#### `@ogify/core`

- **PNG output type** is now `Uint8Array` (compatible with Node `Buffer` and Edge/Workers `Response`)
- **Cache keys** use Web Crypto SHA-256 instead of Node `crypto` (works on Workers / Edge)
- **Filesystem cache** is loaded via dynamic `node:fs` import and clearly Node-only
- **`@resvg/resvg-js`** is no longer imported from the main entry; use `@ogify/core/node` or rely on the Node default

### Notes

- On Cloudflare Workers, pass a *statically imported* WASM module to `createWasmResvg` — runtime `fetch` + `WebAssembly.instantiate` is blocked.
- Use `cache: { type: 'memory' }` on Workers / Edge (`filesystem` requires Node.js).

---

## [1.3.0] - 2026-07-06

### Added

#### `@ogify/core`

- **`htmlSnippet()` utility** — parse trusted inline HTML fragments into Satori-compatible flex word containers (workaround for [vercel/satori#484](https://github.com/vercel/satori/issues/484)). Supports `justify`, `gap`, and `fontSize` options. Invalid or disallowed HTML falls back to plain text.
- **Unit tests** for `htmlSnippet`, `clsx`, `font-fetcher`, and `google-font-detector`.

#### `@ogify/templates`

- **Vitest test suite** for the basic template.

### Changed

#### `@ogify/core`

- **`clsx`** — rewritten with full support for conditional objects, nested arrays, and numbers.
- **Concurrent render deduplication** — duplicate in-flight renders for the same cache key share a single Promise.
- **`renderTemplate`** — params function resolution removed (handled upstream in `TemplateRenderer`).

#### `@ogify/templates`

- **Basic template** — title and subtitle use `htmlSnippet` for inline HTML styling with proper layout/RTL alignment.

### Fixed

#### `@ogify/core`

- **Template validation** — `validateTemplate` now requires a `fonts` array; templates are validated on registration.

### Removed

#### `@ogify/core`

- **`objectToStyle`** — replaced by `htmlSnippet`.
- **`rtl-css-js`** dependency.

### Notes

- `htmlSnippet` is for trusted template-author HTML only, not arbitrary end-user input.

---

## [1.2.0] - 2026-05-13

### Added

#### `@ogify/core`

- **`OgTemplate.renderer` may return JSX** — `renderer` can return `string`, `ReactNode`, or `Promise` of either. HTML strings are still parsed with `satori-html`; non-string values are passed straight to Satori.
- **Explicit error when the renderer returns nothing useful** — `null` or `undefined` at the root now throws with a clear message instead of failing later in Satori.

#### `@ogify/templates`

- **`basic` template as TSX** — the built-in basic template is authored in JSX using Satori’s experimental `tw` prop (with local TypeScript augmentation for `tw` on DOM/SVG props).

### Changed

#### `@ogify/core`

- **Optional peer dependency `react`** — consumers who only use HTML-string templates do not need React; JSX templates should depend on `react` (same as `@ogify/templates`).

#### `@ogify/templates`

- **`react` peer dependency** — apps using `@ogify/templates/basic` must provide React for the automatic JSX runtime.

### Fixed

#### `@ogify/templates`

- **Basic template subtitle** — subtitle block now renders `subtitle` instead of mistakenly repeating `title`.

### Notes

- Satori does not support `dangerouslySetInnerHTML`. For inline HTML inside JSX templates, continue to return a full HTML string from `renderer`, or build the tree with elements Satori supports.

---

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
