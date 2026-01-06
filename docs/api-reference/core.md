# Core API Reference

The `@ogify/core` package provides the main functionality for generating images.

## `createRenderer(options)`

Creates the renderer instance that orchestrates formatting, layout, and image generation.

### Parameters

- `options` (object): Configuration object.
  - `templates` (object): A map of template objects, keyed by a unique string ID.
  - `sharedParams` (optional): Default parameters that will be applied to all templates. Useful for brand consistency.
  - `cache` (optional): Caching configuration.
    - `type`: `'memory'` | `'filesystem'`
    - `ttl` (optional): Time to live in milliseconds.
    - `max` (optional): Maximum number of items in cache.
    - `dir` (optional): Directory for filesystem cache (required if type is `'filesystem'`).
  - `beforeRender` (optional): `(templateId, params) => void | Promise<void>` - Hook called before rendering.
  - `afterRender` (optional): `(templateId, params, buffer) => void | Promise<void>` - Hook called after rendering.

### Returns

- `OgTemplateRenderer`: The renderer instance.

---

## `renderer.renderToImage(templateId, params, options)`

Generates a PNG image buffer for a specific template.

### Parameters

- `templateId` (string): The ID of the template to render (must be one of the keys in `templates` passed to `createRenderer`).
- `params` (object): Parameters specific to the chosen template.
- `options` (optional): Rendering options.
  - `width` (number): Width of the image. Default: `1200`.
  - `height` (number): Height of the image. Default: `630`.
  - `isRTL` (boolean): Whether to enable Right-to-Left support. Default: `false`.
  - `fonts` (array): Custom fonts override.

### Returns

- `Promise<Buffer>`: A promise that resolves to the PNG image buffer.

---

## `defineTemplate(config)`

Helper function to define a template with type safety.

### Parameters

- `config` (object): Template configuration.
  - `renderer` (function): Function that returns an HTML string. Receives `params` and `isRTL`.
  - `fonts` (array): Array of font definitions required by the template.
  - `emojiProvider` (optional): Emoji provider to use (`'twemoji'`, `'fluent'`, etc.).

### Returns

- `OgTemplate`: The defined template object.
