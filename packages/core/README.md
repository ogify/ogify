# OGify - Generate beautiful OG images in minutes

[![npm version](https://badge.fury.io/js/%40ogify%2Fcore.svg)](https://badge.fury.io/js/%40ogify%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Zero-config dynamic Open Graph images for Next.js, Nuxt, Remix, and more. Just copy & paste the production-ready templates.

## ⚡ Why OGify?

- 🔌 **Zero-config**: Works out of the box with Next.js, Remix, Nuxt, and more.
- 🔤 **Hassle-free assets**: Just specify a Google Font name, Emoji provider - no downloads, no font files, no hassle.
- 🎨 **Flexible Customization**: Intuitive API & Tailwind-like syntax helps building eye-catching templates faster.
- 🖼️ **Production-ready templates**: OGify provides a set of production-ready templates with zero configuration.
- ⚡ **Smart caching**: Automatically caches fonts, emojis, and generated images - no configuration required.
- 🛡️ **Type-safe**: Full TypeScript support catches errors before runtime.

## 📦 Installation

```bash
pnpm add @ogify/core
```

or

```bash
npm install @ogify/core
```

or

```bash
yarn add @ogify/core
```

## 🚀 Quick Start

### 1. Define a Template

Create a template using `defineTemplate` or copy/paste one of the [production-ready templates](https://ogify.dev/templates) provided by OGify.

```typescript
import { defineTemplate, OgTemplateOptions } from '@ogify/core';

const blogTemplate = defineTemplate({
  fonts: [
    { name: 'Inter', weight: 400 },
    { name: 'Inter', weight: 700 }
  ],
  /**
   * sharedParams?: OgTemplateParams | (() => Promise<OgTemplateParams>);
   */
  renderer: ({ params }: OgTemplateOptions) => {
    return `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background: white; padding: 40px;">
        <h1 style="font-size: 60px; font-weight: 700; color: #000;">
          ${params.title}
        </h1>
        <p style="font-size: 30px; color: #666;">
          ${params.description}
        </p>
      </div>
    `;
  },
});
```

### 2. Create a Renderer

Create a renderer instance and register your templates:

```typescript
import { createRenderer } from '@ogify/core';

const renderer = createRenderer({
  templates: { 'blog-post': blogTemplate },
  sharedParams: {
    brand: 'My Company'
  }
});
```

### 3. Generate an Image

Render a template to a PNG buffer:

```typescript
// Basic usage (1200x630)
const imageBuffer = await renderer.renderToImage('blog-post', {
  title: 'Hello World',
  description: 'My first OG image'
});

// Custom dimensions for Twitter (1200x675)
const twitterImage = await renderer.renderToImage('blog-post', {
  title: 'Hello World'
}, {
  width: 1200,
  height: 675
});
```

**That's it!** You're ready for production. No font files to download, no build configuration, no asset pipeline.

## 🚀 Time-Saving Features

### **Zero-Config Google Fonts**

Traditional approach (manual setup):

```typescript
// ❌ Manual: Download fonts, manage files, configure paths
import fs from 'fs';

const fontData = fs.readFileSync('./fonts/Inter-Regular.ttf');
const font2Data = fs.readFileSync('./fonts/Inter-Bold.ttf');

const fonts = [
  { name: 'Inter', data: fontData, weight: 400 },
  { name: 'Inter', data: font2Data, weight: 700 }
];
```

OGify approach (zero-config):

```typescript
// ✅ OGify: Just specify the font name - we handle the rest
const template = defineTemplate({
  fonts: [
    { name: 'Inter', weight: 400 },  // Automatically loaded from Google Fonts
    { name: 'Inter', weight: 700 }
  ],
  // ...
});
```

**Time saved**: ~15 minutes per font family

### **Automatic Caching**

```typescript
// First render: Downloads fonts from Google (~500ms)
await renderer.renderToImage('blog-post', { title: 'Post 1' });

// Second render: Uses cached fonts (~50ms) - 10x faster! ⚡
await renderer.renderToImage('blog-post', { title: 'Post 2' });

// All subsequent renders: Lightning fast
await renderer.renderToImage('blog-post', { title: 'Post 3' });
```

**Performance**: 10x faster after first render, no configuration needed

### **Dynamic Emoji Loading**

```typescript
// ✅ Emojis just work - loaded dynamically from CDN
renderer: ({ params }) => `
  <div>
    <h1>${params.title}</h1>
    <div>👋 😄 🎉 🚀</div>  <!-- Automatically rendered -->
  </div>
`
```

**Time saved**: No emoji sprite sheets, no asset management, no build step

## 📚 Advanced Usage

### Custom Fonts

Load fonts from Google Fonts, custom URLs, or embedded data:

```typescript
const template = defineTemplate({
  fonts: [
    // Google Fonts (automatic)
    { name: 'Roboto', weight: 400 },
    
    // Custom URL
    { name: 'MyFont', url: 'https://example.com/font.woff2', weight: 700 },
    
    // Embedded data
    { name: 'EmbeddedFont', data: fontBuffer, weight: 400 }
  ],
  renderer: ({ params }) => `<div>${params.title}</div>`
});
```

### Emoji Support

Choose from multiple emoji providers:

```typescript
const template = defineTemplate({
  fonts: [{ name: 'Inter', weight: 400 }],
  emojiProvider: 'twemoji', // 'fluent' | 'fluentFlat' | 'noto' | 'blobmoji' | 'openmoji'
  renderer: ({ params }) => `
    <div>
      <h1>${params.title}</h1>
      <div>👋 😄 🎉</div>
    </div>
  `
});
```

### Lifecycle Hooks

Add custom logic before and after rendering:

```typescript
const renderer = createRenderer({
  templates: { 'blog-post': blogTemplate },
  beforeRender: async (templateId, params) => {
    console.log(`Rendering ${templateId}`, params);
    // Log analytics, validate params, etc.
  },
  afterRender: async (templateId, params, imageBuffer) => {
    console.log(`Rendered ${templateId} successfully`);
    // Cache image, send notifications, etc.
  }
});
```

### Caching Configuration

Configure caching strategy for fonts and emojis/icons:

```typescript
// Memory Cache (default)
const memoryRenderer = createRenderer({
  templates: { 'blog-post': blogTemplate },
  cache: {
    type: 'memory',
    ttl: 3600000, // 1 hour
    max: 100 // max items
  }
});

// Filesystem Cache
const fsRenderer = createRenderer({
  templates: { 'blog-post': blogTemplate },
  cache: {
    type: 'filesystem',
    dir: './.ogify-cache', // cache directory
    ttl: 3600000, // 1 hour
    max: 100 // max items
  }
});
```

### Platform-Specific Dimensions

Generate images for different platforms:

```typescript
// Facebook/LinkedIn (1200x630)
const facebookImage = await renderer.renderToImage('blog-post', params);

// Twitter (1200x675)
const twitterImage = await renderer.renderToImage('blog-post', params, {
  width: 1200,
  height: 675
});
```

## 🎨 Template Features

### Supported CSS Properties

Templates support a subset of CSS properties via Satori. See [Satori CSS](https://github.com/vercel/satori?tab=readme-ov-file#css) for more details.

- **Layout**: `display: flex`, `flexDirection`, `alignItems`, `justifyContent`
- **Spacing**: `padding`, `margin`, `gap`
- **Typography**: `fontSize`, `fontWeight`, `color`, `lineHeight`, `textAlign`
- **Background**: `backgroundColor`, `backgroundImage`
- **Border**: `border`, `borderRadius`
- **Size**: `width`, `height`, `maxWidth`, `maxHeight`
- ...

### Tailwind-like Utilities

You can use Tailwind-like class names:

```typescript
renderer: ({ params }) => `
  <div class="flex flex-col items-center justify-center w-full h-full bg-white p-4">
    <h1 class="text-[60px] font-bold text-black">${params.title}</h1>
    <p class="text-[30px] text-gray-600">${params.description}</p>
  </div>
`
```

## 📖 API Reference

### `defineTemplate(config)`

Defines a new OG template.

**Parameters:**

- `renderer` (function): Function that returns HTML string
- `fonts` (array): Array of font configurations
- `emojiProvider` (optional): Emoji provider to use

**Returns:** `OgTemplate`

### `createRenderer(config)`

Creates a new template renderer instance.

**Parameters:**

- `templates` (object): Map of template definitions keyed by ID
- `sharedParams` (optional): Default parameters for all templates
- `cache` (optional): Cache configuration object
- `beforeRender` (optional): Hook called before rendering
- `afterRender` (optional): Hook called after rendering

**Returns:** `TemplateRenderer`

### `renderer.renderToImage(templateId, params, options?)`

Renders a template to a PNG buffer.

**Parameters:**

- `templateId` (string): ID of the template to render
- `params` (object): Parameters to pass to the template
- `options` (optional): Rendering options
  - `width` (number): Image width (default: 1200)
  - `height` (number): Image height (default: 630)

**Returns:** `Promise<Buffer>`

### `renderer.getTemplate(id)`

Retrieves a template by ID.

**Returns:** `OgTemplate | undefined`

**Returns:** `OgTemplate | undefined`

## ⚡ Performance & Production

### **Automatic Caching (Zero Config)**

OGify automatically caches fonts, emojis, and generated images in memory - no configuration required

```typescript
// First render: Downloads fonts from Google Fonts (~500ms)
await renderer.renderToImage('blog-post', { title: 'Post 1' });

// Second render: Uses cached fonts (~50ms) - 10x faster! ⚡
await renderer.renderToImage('blog-post', { title: 'Post 2' });

// Third+ renders: Lightning fast from cache
await renderer.renderToImage('blog-post', { title: 'Post 3' });
```

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete history of changes and releases.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Built on top of:

- [satori](https://github.com/vercel/satori) - SVG generation
- [satori-html](https://github.com/vercel/satori-html) - HTML to VDOM conversion
- [@resvg/resvg-js](https://github.com/thx/resvg-js) - SVG to PNG conversion
- [lru-cache](https://github.com/isaacs/node-lru-cache) - LRU cache
