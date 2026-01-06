# Core API Reference

The `@ogify/core` package provides the main functionality for generating images.

## `createRenderer(options)`

Creates the renderer instance that orchestrates formatting, layout, and image generation. This is a factory function that returns a `TemplateRenderer` instance.

### Parameters

- `options` (object): Configuration object.
  - `templates` (object): A map of template objects, keyed by a unique string ID.
  - `sharedParams` (optional): Default parameters that will be applied to all templates. Useful for brand consistency. Can be an object or a function returning a Promise.
  - `cache` (optional): Caching configuration.
    - `type`: `'memory'` | `'filesystem'` | `false` (to disable caching)
    - `ttl` (optional): Time to live in milliseconds. Default: No expiration.
    - `max` (optional): Maximum number of items in cache. Default: 100.
    - `dir` (optional): Directory for filesystem cache (required if type is `'filesystem'`).
  - `beforeRender` (optional): `(templateId, params) => void | Promise<void>` - Hook called before rendering.
  - `afterRender` (optional): `(templateId, params, buffer) => void | Promise<void>` - Hook called after rendering.

### Returns

- `TemplateRenderer`: The renderer instance.

### Example

```typescript
import { createRenderer } from '@ogify/core';
import basicTemplate from '@ogify/templates/basic';
import type { TemplateParams } from '@ogify/templates/basic';

const renderer = createRenderer<{ basic: TemplateParams }>({
  templates: { basic: basicTemplate },
  sharedParams: {
    brandName: 'My Company',
    brandLogo: 'https://example.com/logo.png',
  },
  cache: {
    type: 'memory',
    ttl: 3600000, // 1 hour
    max: 100,
  },
  beforeRender: async (templateId, params) => {
    console.log(`Rendering template: ${templateId}`);
  },
  afterRender: async (templateId, params, buffer) => {
    console.log(`Generated ${buffer.length} bytes`);
  },
});
```

---

## `TemplateRenderer`

The main class for managing templates and rendering images. Typically created via `createRenderer()`, but can be instantiated directly if needed.

### Methods

#### `getTemplate(id)`

Retrieves a template by its unique ID.

**Parameters:**

- `id` (string): The template ID to look up.

**Returns:**

- `OgTemplate | undefined`: The template definition, or undefined if not found.

#### `renderToImage(templateId, params, options)`

Generates a PNG image buffer for a specific template.

**Parameters:**

- `templateId` (string): The ID of the template to render.
- `params` (object | function): Parameters specific to the chosen template, or a function returning a Promise of parameters.
- `options` (optional): Rendering options.
  - `width` (number): Width of the image. Default: `1200`.
  - `height` (number): Height of the image. Default: `630`.
  - `isRTL` (boolean): Whether to enable Right-to-Left support. Default: `false`.
  - `fonts` (array): Custom fonts override.

**Returns:**

- `Promise<Buffer>`: A promise that resolves to the PNG image buffer.

**Example:**

```typescript
// With static parameters
const buffer = await renderer.renderToImage('basic', {
  title: 'Hello World',
  layout: 'centered',
});

// With async parameters
const buffer = await renderer.renderToImage('basic', async () => {
  const data = await fetchBlogPost();
  return {
    title: data.title,
    subtitle: data.excerpt,
  };
});

// With RTL support
const buffer = await renderer.renderToImage('basic', {
  title: 'مرحبا بالعالم',
}, {
  isRTL: true,
});
```

---

## `defineTemplate(config)`

Helper function to define a template with type safety.

### Parameters

- `config` (object): Template configuration.
  - `renderer` (function): Function that returns an HTML string. Receives `{ params, isRTL }`.
  - `fonts` (array): Array of font definitions required by the template.
  - `emojiProvider` (optional): Emoji provider to use (`'twemoji'`, `'fluent'`, `'fluentFlat'`, `'noto'`, `'blobmoji'`, `'openmoji'`). Default: `'twemoji'`.

### Returns

- `OgTemplate`: The defined template object.

### Example

```typescript
import { defineTemplate } from '@ogify/core';

export type MyTemplateParams = {
  title: string;
  description: string;
};

const myTemplate = defineTemplate<MyTemplateParams>({
  fonts: [
    { name: 'Inter', weight: 400 },
    { name: 'Inter', weight: 700 },
  ],
  emojiProvider: 'twemoji',
  renderer: ({ params, isRTL }) => {
    return `
      <div style="display: flex; width: 100%; height: 100%; direction: ${isRTL ? 'rtl' : 'ltr'};">
        <h1>${params.title}</h1>
        <p>${params.description}</p>
      </div>
    `;
  },
});

export default myTemplate;
```

---

## Type Definitions

### `OgTemplateParams`

Base type for template parameters. All template parameter types should extend this.

### `OgFontConfig`

Font configuration object:

```typescript
type OgFontConfig = {
  name: string;           // Font family name
  weight?: number;        // Font weight (e.g., 400, 700)
  style?: 'normal' | 'italic';
  url?: string;           // URL to font file
  data?: Buffer;          // Font file as buffer
};
```

### `OgTemplateOptions`

Rendering options:

```typescript
type OgTemplateOptions = {
  width?: number;         // Default: 1200
  height?: number;        // Default: 630
  isRTL?: boolean;        // Default: false
  fonts?: OgFontConfig[]; // Override template fonts
};
```
