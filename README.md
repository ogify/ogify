# OGify - Type-Safe Open Graph Image Generator

[![npm version](https://badge.fury.io/js/%40ogify%2Fcore.svg)](https://badge.fury.io/js/%40ogify%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A complete, production-ready library for generating Open Graph images with full TypeScript support, built on top of [Satori](https://github.com/vercel/satori).

## ✨ Features

- **🎯 Type-Safe**: Full TypeScript support with strict type checking and Zod schema validation
- **🔧 Flexible Registration**: Register and configure templates with dynamic defaults and transforms
- **🎨 Theme System**: Comprehensive theming with inheritance
- **⚡ High Performance**: Optimized for serverless environments
- **🔄 Parameter Merging**: Smart parameter merging with priority chains

## 📦 Installation

```bash
pnpm add @ogify/core
```

## 🚀 Quick Start

### 1. Define a Template

First, define a template using `defineTemplate`. You'll need to provide a Zod schema for your parameters and a component function that returns the React element to render.

```typescript
import { defineTemplate } from '@ogify/core';
import { z } from 'zod';

const myTemplate = defineTemplate({
  id: 'my-template',
  name: 'My Template',
  description: 'A simple example template',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
  component: ({ params, theme }) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: theme?.colors?.background || '#fff',
          padding: '40px',
        }}
      >
        <h1 style={{ fontSize: '60px', color: theme?.colors?.text || '#000' }}>
          {params.title}
        </h1>
        {params.description && (
          <p style={{ fontSize: '30px', color: theme?.colors?.secondary || '#666' }}>
            {params.description}
          </p>
        )}
      </div>
    );
  },
});
```

### 2. Create a Handler

Create a handler instance and register your templates.

```typescript
import { createTemplateHandler } from '@ogify/core';

const handler = createTemplateHandler({
  templates: [myTemplate],
  globalTheme: {
    colors: {
      primary: '#3b82f6',
      background: '#ffffff',
      text: '#000000',
    },
  },
});
```

### 3. Generate an Image

Use the handler to render an image buffer or generate a link.

```typescript
// Render to PNG buffer
const pngBuffer = await handler.renderToImage('my-template', {
  title: 'Hello World',
  description: 'This is an awesome OG image',
});

// Generate a link (useful for API routes)
const url = handler.generateOGLink('my-template', {
  title: 'Hello World',
});
// Output: /api/og?template=my-template&title=Hello+World
```

## 📚 Advanced Usage

### Template Registration with Configuration

You can register templates with custom configuration, such as default parameters or themes.

```typescript
const handler = createTemplateHandler({
  templates: [
    {
      template: myTemplate,
      defaultParams: {
        description: 'Default description',
      },
      theme: {
        colors: {
          background: '#000000',
          text: '#ffffff',
        },
      },
    },
  ],
});
```

### Dynamic Defaults

Default parameters can be dynamic functions.

```typescript
{
  template: myTemplate,
  defaultParams: () => ({
    date: new Date().toISOString(),
  }),
}
```

## 📖 API Documentation

### `defineTemplate(config)`

Defines a new OG template.

- `id`: Unique identifier for the template.
- `name`: Human-readable name.
- `schema`: Zod schema for parameter validation.
- `component`: Function that returns the React element.

### `createTemplateHandler(config)`

Creates a new template handler.

- `templates`: Array of templates or template registrations.
- `globalDefaults`: Global default parameters.
- `globalTheme`: Global theme configuration.
- `cache`: Cache configuration.

### `handler.renderToImage(templateId, params, options)`

Renders a template to an image buffer.

### `handler.generateOGLink(templateId, params, options)`

Generates a URL for the OG image.

## 🤝 Contributing

We welcome contributions!

## 📄 License

MIT License.
