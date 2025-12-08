# OGify - Beautiful Dynamic OG Images in Seconds

[![npm version](https://badge.fury.io/js/%40ogify%2Fcore.svg)](https://badge.fury.io/js/%40ogify%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A lightweight, production-ready library for generating Open Graph images with full TypeScript support, built on top of [Satori](https://github.com/vercel/satori).

## ✨ Features

- **🎯 Type-Safe**: Full TypeScript support with strict type checking
- **🎨 Flexible Templates**: HTML-based templates with Tailwind-like utilities
- **⚡ High Performance**: Optimized for serverless environments with built-in caching
- **� Smart Font Loading**: Automatic Google Fonts detection and loading
- **😀 Emoji Support**: Multiple emoji providers (Twemoji, Fluent, Noto, etc.)
- **📐 Custom Dimensions**: Support for custom image sizes

## 📦 Installation

```bash
pnpm add @ogify/core
```

## 🚀 Quick Start

### 1. Define a Template

Create a template using `defineTemplate` with an HTML renderer function:

```typescript
import { defineTemplate, OgTemplateOptions } from '@ogify/core';

const blogTemplate = defineTemplate({
  id: 'blog-post',
  name: 'Blog Post',
  description: 'Template for blog post OG images',
  fonts: [
    { name: 'Inter', weight: 700 },
    { name: 'Inter', weight: 400 }
  ],
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
import { createTemplateRenderer } from '@ogify/core';

const renderer = createTemplateRenderer({
  templates: [blogTemplate],
  defaultParams: {
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

## 📚 Advanced Usage

### Custom Fonts

Load fonts from Google Fonts, custom URLs, or embedded data:

```typescript
const template = defineTemplate({
  id: 'custom-fonts',
  name: 'Custom Fonts Template',
  description: 'Template with custom fonts',
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
  id: 'emoji-template',
  name: 'Emoji Template',
  description: 'Template with emoji support',
  fonts: [{ name: 'Inter', weight: 400 }],
  emojiProvider: 'twemoji', // or 'fluent', 'noto', 'openmoji', etc.
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
const renderer = createTemplateRenderer({
  templates: [blogTemplate],
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

Templates support a subset of CSS properties via Satori:

- **Layout**: `display: flex`, `flexDirection`, `alignItems`, `justifyContent`
- **Spacing**: `padding`, `margin`, `gap`
- **Typography**: `fontSize`, `fontWeight`, `color`, `lineHeight`, `textAlign`
- **Background**: `backgroundColor`, `backgroundImage`
- **Border**: `border`, `borderRadius`
- **Size**: `width`, `height`, `maxWidth`, `maxHeight`

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
- `id` (string): Unique identifier
- `name` (string): Human-readable name
- `description` (string): Template description
- `renderer` (function): Function that returns HTML string
- `fonts` (array): Array of font configurations
- `emojiProvider` (optional): Emoji provider to use

**Returns:** `OgTemplate`

### `createTemplateRenderer(config)`

Creates a new template renderer instance.

**Parameters:**
- `templates` (array): Array of template definitions
- `defaultParams` (optional): Default parameters for all templates
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

### `renderer.getTemplateIds()`

Gets all registered template IDs.

**Returns:** `string[]`

## ⚡ Performance

### Caching

Fonts and emojis are automatically cached:

```typescript
// First render: Downloads fonts
await renderer.renderToImage('blog-post', { title: 'Post 1' });

// Subsequent renders: Uses cached fonts (much faster!)
await renderer.renderToImage('blog-post', { title: 'Post 2' });
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
- [resvg-js](https://github.com/thx/resvg-js) - PNG conversion
